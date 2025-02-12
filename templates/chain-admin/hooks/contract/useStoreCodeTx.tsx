import { useChain } from '@interchain-kit/react';
import { AccessType } from '@interchainjs/react/cosmwasm/wasm/v1/types';
import { useStoreCode } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.react';
import { MsgStoreCode } from '@interchainjs/react/cosmwasm/wasm/v1/tx';
import { StdFee } from '@interchainjs/react/types';
import { Box } from '@interchain-ui/react';
import { defaultContext } from '@tanstack/react-query';
import { gzip } from 'node-gzip';

import { prettyStoreCodeTxResult } from '@/utils';

import { useToast, useCustomSigningClient } from '../common';

type StoreCodeTxParams = {
  wasmFile: File;
  permission: AccessType;
  addresses: string[];
  onTxSucceed?: (codeId: string) => void;
  onTxFailed?: () => void;
};

export const useStoreCodeTx = (chainName: string) => {
  const { address } = useChain(chainName);
  const { toast } = useToast();
  const { data: signingClient } = useCustomSigningClient();
  const { mutate: storeCode, isLoading } = useStoreCode({
    clientResolver: signingClient,
    options: {
      context: defaultContext,
    },
  });

  const storeCodeTx = async ({
    wasmFile,
    permission,
    addresses,
    onTxSucceed = () => {},
    onTxFailed = () => {},
  }: StoreCodeTxParams) => {
    if (!address) return;

    const toastId = toast({
      title: 'Sending Transaction',
      type: 'loading',
      duration: 999999,
    });

    const wasmCode = await wasmFile.arrayBuffer();
    const wasmByteCode = new Uint8Array(await gzip(new Uint8Array(wasmCode)));

    const message = MsgStoreCode.fromPartial({
      sender: address,
      wasmByteCode,
      instantiatePermission: {
        permission,
        addresses,
      },
    });

    const fee: StdFee = { amount: [], gas: '5800000' };

    storeCode(
      {
        signerAddress: address,
        message,
        fee,
        memo: 'Store Code',
      },
      {
        onSuccess: (res) => {
          if (res.code !== 0) {
            throw new Error(res.rawLog || 'Failed to upload contract');
          }
          onTxSucceed(prettyStoreCodeTxResult(res).codeId);
          toast.close(toastId);
          toast({
            title: 'Contract uploaded successfully',
            type: 'success',
          });
        },
        onError: (error) => {
          console.error('Failed to upload contract:', error);
          onTxFailed();
          toast.close(toastId);
          toast({
            title: 'Transaction Failed',
            type: 'error',
            description: (
              <Box width="300px" wordBreak="break-all">
                {error.message}
              </Box>
            ),
            duration: 10000,
          });
        },
      }
    );
  };

  return { storeCodeTx, isLoading };
};
