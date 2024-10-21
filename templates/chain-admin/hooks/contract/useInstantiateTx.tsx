import { Box } from '@interchain-ui/react';
import { useChain } from '@cosmos-kit/react';
import { Coin, StdFee } from '@cosmjs/amino';
import { InstantiateResult } from '@cosmjs/cosmwasm-stargate';
import { DeliverTxResponse, getSigningJsdClient, jsd } from 'hyperwebjs';
import { useState, useCallback } from 'react';

import { useToast } from '../common';

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

interface HandleTxParams<T> {
  executeTx: () => Promise<T>;
  successMessage: string;
  onTxSucceed?: (result: T) => void;
  onTxFailed?: () => void;
}

export const useInstantiateTx = (chainName: string) => {
  const { getSigningCosmWasmClient } = useChain(chainName);
  const { getRpcEndpoint, getOfflineSigner } = useChain(chainName);
  const { toast } = useToast();
  const [toastId, setToastId] = useState<string | number | undefined>();

  const handleTx = useCallback(
    async <T,>({
      executeTx,
      successMessage,
      onTxSucceed = () => {},
      onTxFailed = () => {},
    }: HandleTxParams<T>) => {
      setToastId(
        toast({
          title: 'Sending Transaction',
          type: 'loading',
          duration: 999999,
        })
      );

      try {
        const result = await executeTx();
        onTxSucceed(result);
        toast.close(toastId);
        toast({
          title: successMessage,
          type: 'success',
        });
      } catch (e: any) {
        console.error(e);
        onTxFailed();
        toast.close(toastId);
        toast({
          title: 'Transaction Failed',
          type: 'error',
          description: (
            <Box width="300px" wordBreak="break-all">
              {e.message}
            </Box>
          ),
          duration: 10000,
        });
      }
    },
    [toast, toastId]
  );

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
    const client = await getSigningCosmWasmClient();
    const fee: StdFee = { amount: [], gas: '300000' };

    await handleTx<InstantiateResult>({
      executeTx: () => {
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
      executeTx: async () => {
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
