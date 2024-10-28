import { useChain } from '@cosmos-kit/react';
import { Coin, StdFee } from '@cosmjs/amino';
import { InstantiateResult } from '@cosmjs/cosmwasm-stargate';
import { DeliverTxResponse, getSigningJsdClient, jsd } from 'hyperwebjs';

import { useHandleTx } from './useHandleTx';

interface InstantiateTxParams {
  address: string;
  codeId: number;
  initMsg: object;
  label: string;
  admin: string;
  funds: Coin[];
  onTxSucceed?: (txInfo: InstantiateResult) => void;
  onTxFailed?: () => void;
}

interface InstantiateJsdTxParams {
  address: string;
  code: string;
  onTxSucceed?: (txInfo: DeliverTxResponse) => void;
  onTxFailed?: () => void;
}

export const useInstantiateTx = (chainName: string) => {
  const { getSigningCosmWasmClient } = useChain(chainName);
  const { getRpcEndpoint, getOfflineSigner } = useChain(chainName);
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

    await handleTx<InstantiateResult>({
      txFunction: async () => {
        const client = await getSigningCosmWasmClient();
        return client.instantiate(address, codeId, initMsg, label, fee, {
          admin,
          funds,
        });
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
          rpcEndpoint: await getRpcEndpoint(),
          signer: getOfflineSigner(),
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
