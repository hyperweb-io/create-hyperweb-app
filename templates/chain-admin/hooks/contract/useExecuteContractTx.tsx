import { useChain } from '@interchain-kit/react';
import { getSigningJsdClient, jsd } from 'hyperwebjs';
import { createExecuteContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.func';
import { Coin, StdFee } from '@interchainjs/react/types';

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
        const executeContract = createExecuteContract(signingClient);
        const res = await executeContract(
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
        const signingClient = await getSigningJsdClient({
          rpcEndpoint: rpcEndpoint!,
          signer: wallet.getOfflineSignerDirect(chain.chainId ?? ''),
        });

        return signingClient.signAndBroadcast(address, [msg], fee);
      },
      onTxSucceed,
      onTxFailed,
    });
  };

  return { executeTx, executeJsdTx };
};
