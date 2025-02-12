import { useChain } from '@interchain-kit/react';
import { useQuery } from '@tanstack/react-query';
import { jsd } from 'hyperwebjs';

import { useChainStore } from '@/contexts';
import { useIsHyperwebChain } from '../common';

export type JsdQueryClient = NonNullable<
  Awaited<ReturnType<typeof useJsdQueryClient>['data']>
>;

export const useJsdQueryClient = () => {
  const { selectedChain } = useChainStore();
  const { getRpcEndpoint } = useChain(selectedChain);
  const isHyperwebChain = useIsHyperwebChain();

  return useQuery({
    queryKey: ['jsdQueryClient', isHyperwebChain],
    queryFn: async () => {
      const rpcEndpoint = await getRpcEndpoint();
      const client = await jsd.ClientFactory.createRPCQueryClient({
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
