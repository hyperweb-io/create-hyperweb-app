import { useChain } from '@interchain-kit/react';
import { hyperweb, getSigningHyperwebClient } from 'hyperwebjs';
import { executeContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.func';
import { StdFee } from '@interchainjs/react/types';
import { Coin } from '@interchainjs/react/cosmos/base/v1beta1/coin';

import { toUint8Array } from '@/utils';

import { useHandleTx } from './useHandleTx';
import { useRpcEndpoint } from '../common';

interface ExecuteTxParams {
  address: string;
  contractAddress: string;
  fee: StdFee;
  msg: object;
  funds: Coin[];
  onTxSucceed?: () => void;
  onTxFailed?: () => void;
}

interface ExecuteJsdTxParams {
  address: string;
  contractIndex: string;
  fnName: string;
  arg: string;
  onTxSucceed?: () => void;
  onTxFailed?: () => void;
}

export const useExecuteContractTx = (chainName: string) => {
  const { data: rpcEndpoint } = useRpcEndpoint(chainName);
  const { chain, wallet } = useChain(chainName);
  const handleTx = useHandleTx(chainName);

  const executeTx = async ({
    address,
    contractAddress,
    fee,
    funds,
    msg,
    onTxFailed = () => {},
    onTxSucceed = () => {},
  }: ExecuteTxParams) => {
    await handleTx({
      txFunction: async () => {
        throw new Error(
          'WASM contract execution not supported in hyperwebjs 1.1.1. Use executeJsdTx for JS contracts.'
        );
      },
      onTxSucceed,
      onTxFailed,
    });
  };

  const executeJsdTx = async ({
    address,
    contractIndex,
    fnName,
    arg,
    onTxFailed = () => {},
    onTxSucceed = () => {},
  }: ExecuteJsdTxParams) => {
    const fee = { amount: [], gas: '550000' };

    await handleTx({
      txFunction: async () => {
        if (!rpcEndpoint) {
          throw new Error('RPC endpoint is not available');
        }

        const chainId = chain.chainId ?? '';

        if (!(window as any).keplr) {
          throw new Error('Keplr wallet not available');
        }

        // Create signing client using hyperwebjs 1.1.1
        const signingClient = await getSigningHyperwebClient({
          rpcEndpoint,
          signer: (window as any).keplr.getOfflineSigner(chainId),
        });

        const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
          address: contractIndex, // Contract address in 1.1.1
          creator: address,
          callee: fnName,
          args: [arg],
        });

        const result = await signingClient.signAndBroadcast(
          address,
          [msg],
          fee
        );
        return result;
      },
      onTxSucceed,
      onTxFailed,
    });
  };

  return { executeTx, executeJsdTx };
};
