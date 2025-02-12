import { useChain } from '@interchain-kit/react';
import { useQuery } from '@tanstack/react-query';

export const useSigningClient = (chainName: string) => {
  const { getSigningClient, address } = useChain(chainName);

  return useQuery({
    queryKey: ['signingClient', chainName],
    queryFn: async () => {
      return await getSigningClient();
    },
    enabled: !!address,
    staleTime: Infinity,
  });
};
