import { useChain } from '@interchain-kit/react';
import { getSigningJsdClient, jsd } from 'hyperwebjs';
import { executeContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.func';
import { StdFee } from '@interchainjs/react/types';
import { Coin } from '@interchainjs/react/cosmos/base/v1beta1/coin';

import { toUint8Array } from '@/utils';

import { useHandleTx } from './useHandleTx';
import { useCustomSigningClient, useRpcEndpoint } from '../common';

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
  const { data: signingClient } = useCustomSigningClient();
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
        if (!signingClient) {
          throw new Error('Signing client is not available');
        }

        const res = await executeContract(
          signingClient,
          address,
          {
            sender: address,
            contract: contractAddress,
            msg: toUint8Array(msg),
            funds,
          },
          fee,
          ''
        );
        return res;
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
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: BigInt(contractIndex),
      fnName,
      arg,
    });

    const fee = { amount: [], gas: '550000' };

    await handleTx({
      txFunction: async () => {
        if (!rpcEndpoint) {
          throw new Error('RPC endpoint is not available');
        }

        // Try using the raw Keplr amino signer directly
        const chainId = chain.chainId ?? '';
        const keplrAminoSigner = (
          window as any
        ).keplr?.getOfflineSignerOnlyAmino(chainId);

        if (!keplrAminoSigner) {
          throw new Error('Keplr wallet not available');
        }

        const signingClient = await getSigningJsdClient({
          rpcEndpoint,
          signer: keplrAminoSigner as any,
        });

        return signingClient.signAndBroadcast(address, [msg], fee);
      },
      onTxSucceed,
      onTxFailed,
    });
  };

  return { executeTx, executeJsdTx };
};
