import { hyperweb, getSigningHyperwebClient } from 'hyperwebjs';
import { instantiateContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.func';
import { DeliverTxResponse } from '@interchainjs/react/types';
import { StdFee } from '@interchainjs/react/types';
import { Coin } from '@interchainjs/react/cosmos/base/v1beta1/coin';
import { useChain } from '@interchain-kit/react';

import { toUint8Array } from '@/utils';

import { useHandleTx } from './useHandleTx';
import { useRpcEndpoint } from '../common';

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
        throw new Error(
          'WASM contract instantiation not supported in hyperwebjs 1.1.1. Use instantiateJsdTx for JS contracts.'
        );
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

        const msg = hyperweb.hvm.MessageComposer.fromPartial.instantiate({
          creator: address,
          code,
          source: 'chain-admin', // Set a default source value
        });

        const result = await signingClient.signAndBroadcast(
          address,
          [msg],
          fee
        );
        return result;
      },
      successMessage: 'Deploy Success',
      onTxSucceed,
      onTxFailed,
    });
  };

  return { instantiateTx, instantiateJsdTx };
};
