import { useChain } from '@interchain-kit/react';
import { useQuery } from '@tanstack/react-query';

export const useRpcEndpoint = (chainName: string) => {
  const { getRpcEndpoint } = useChain(chainName);

  return useQuery({
    queryKey: ['rpcEndpoint', chainName],
    queryFn: async () => {
      return await getRpcEndpoint();
    },
    staleTime: Infinity,
  });
};
