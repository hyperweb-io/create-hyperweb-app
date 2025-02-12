import { DeliverTxResponse, getSigningJsdClient, jsd } from 'hyperwebjs';
import { createInstantiateContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.func';
import { Coin, StdFee } from '@interchainjs/react/types';
import { useChain } from '@interchain-kit/react';

import { toUint8Array } from '@/utils';

import { useHandleTx } from './useHandleTx';
import { useCustomSigningClient, useRpcEndpoint } from '../common';

interface InstantiateTxParams {
  address: string;
  codeId: number;
  initMsg: object;
  label: string;
  admin: string;
  funds: Coin[];
  onTxSucceed?: (txInfo: DeliverTxResponse) => void;
  onTxFailed?: () => void;
}

interface InstantiateJsdTxParams {
  address: string;
  code: string;
  onTxSucceed?: (txInfo: DeliverTxResponse) => void;
  onTxFailed?: () => void;
}

export const useInstantiateTx = (chainName: string) => {
  const { data: signingClient } = useCustomSigningClient();
  const { data: rpcEndpoint } = useRpcEndpoint(chainName);
  const { chain, wallet } = useChain(chainName);
  const handleTx = useHandleTx(chainName);

  const instantiateTx = async ({
    address,
    codeId,
    initMsg,
    label,
    admin,
    funds,
    onTxSucceed,
    onTxFailed,
  }: InstantiateTxParams) => {
    const fee: StdFee = { amount: [], gas: '300000' };

    await handleTx<DeliverTxResponse>({
      txFunction: async () => {
        const instantiateContract = createInstantiateContract(signingClient);
        const res = await instantiateContract(
          address,
          {
            sender: address,
            codeId: BigInt(codeId),
            admin,
            funds,
            label,
            msg: toUint8Array(initMsg),
          },
          fee,
          ''
        );
        return res;
      },
      successMessage: 'Instantiate Success',
      onTxSucceed,
      onTxFailed,
    });
  };

  const instantiateJsdTx = async ({
    address,
    code,
    onTxSucceed,
    onTxFailed,
  }: InstantiateJsdTxParams) => {
    const fee: StdFee = { amount: [], gas: '550000' };

    await handleTx<DeliverTxResponse>({
      txFunction: async () => {
        const signingClient = await getSigningJsdClient({
          rpcEndpoint: rpcEndpoint!,
          signer: wallet.getOfflineSignerDirect(chain.chainId ?? ''),
        });

        const msg = jsd.jsd.MessageComposer.fromPartial.instantiate({
          creator: address,
          code,
        });

        return signingClient.signAndBroadcast(
          address,
          [msg],
          fee
        ) as Promise<DeliverTxResponse>;
      },
      successMessage: 'Deploy Success',
      onTxSucceed,
      onTxFailed,
    });
  };

  return { instantiateTx, instantiateJsdTx };
};
