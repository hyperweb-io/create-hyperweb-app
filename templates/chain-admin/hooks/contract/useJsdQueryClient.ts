import { useChain } from '@interchain-kit/react';
import { useQuery } from '@tanstack/react-query';
import { hyperweb } from 'hyperwebjs';

import { useChainStore } from '@/contexts';
import { useIsHyperwebChain } from '../common';

export type HyperwebQueryClient = NonNullable<
  Awaited<ReturnType<typeof useHyperwebQueryClient>['data']>
>;

export const useHyperwebQueryClient = () => {
  const { selectedChain } = useChainStore();
  const { getRpcEndpoint } = useChain(selectedChain);
  const isHyperwebChain = useIsHyperwebChain();

  return useQuery({
    queryKey: ['hyperwebQueryClient', isHyperwebChain],
    queryFn: async () => {
      const rpcEndpoint = await getRpcEndpoint();
      const client = await hyperweb.ClientFactory.createRPCQueryClient({
        rpcEndpoint,
      });
      return client;
    },
    enabled: isHyperwebChain,
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};

// Alias for backward compatibility
export const useJsdQueryClient = useHyperwebQueryClient;
export type JsdQueryClient = HyperwebQueryClient;
