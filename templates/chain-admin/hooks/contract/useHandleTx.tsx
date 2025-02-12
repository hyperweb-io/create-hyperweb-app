import Link from 'next/link';
import { useState, useCallback } from 'react';
import { Box, Text, Icon } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';

import { useToast } from '../common';
import { getExplorerLink } from '@/utils';

interface HandleTxParams<T> {
  txFunction: () => Promise<T>;
  successMessage?: string;
  onTxSucceed?: (result: T) => void;
  onTxFailed?: () => void;
}

export const useHandleTx = (chainName: string) => {
  const { toast } = useToast();
  const { chain } = useChain(chainName);
  const [toastId, setToastId] = useState<string | number | undefined>();

  return useCallback(
    async <T,>({
      txFunction,
      successMessage = 'Transaction Successful',
      onTxSucceed = () => {},
      onTxFailed = () => {},
    }: HandleTxParams<T>) => {
      const toastId = toast({
        title: 'Sending Transaction',
        type: 'loading',
        duration: 999999,
      });

      setToastId(toastId);

      try {
        const result: any = await txFunction();
        if (result.code !== 0) {
          throw new Error(result.rawLog);
        }
        onTxSucceed(result);
        toast.close(toastId);

        const explorerLink = getExplorerLink(chain, result?.transactionHash);

        toast({
          title: successMessage,
          type: 'success',
          description: explorerLink ? (
            <Link href={explorerLink} target="_blank">
              <Box display="flex" gap="6px" alignItems="center" color="$text">
                <Text fontSize="14px">View tx details</Text>
                <Icon name="externalLinkLine" />
              </Box>
            </Link>
          ) : undefined,
        });
      } catch (e: any) {
        console.error(e);
        onTxFailed();
        toast.close(toastId);
        toast({
          title: 'Transaction Failed',
          type: 'error',
          description: (
            <Box width="300px" wordBreak="break-word">
              {e.message}
            </Box>
          ),
          duration: 10000,
        });
      }
    },
    [toast, toastId]
  );
};
