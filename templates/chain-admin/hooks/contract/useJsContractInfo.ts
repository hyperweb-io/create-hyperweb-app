import { useQuery } from '@tanstack/react-query';
import { useJsdQueryClient } from './useJsdQueryClient';

export const useJsContractInfo = ({
  contractIndex,
  enabled = true,
}: {
  contractIndex: string;
  enabled?: boolean;
}) => {
  const { data: jsdQueryClient } = useJsdQueryClient();

  return useQuery({
    queryKey: ['useJsContractInfo', contractIndex],
    queryFn: async () => {
      if (!jsdQueryClient) return null;

      const response = await jsdQueryClient.jsd.jsd.contracts({
        index: BigInt(contractIndex),
      });

      return response;
    },
    enabled: !!contractIndex && enabled,
  });
};
