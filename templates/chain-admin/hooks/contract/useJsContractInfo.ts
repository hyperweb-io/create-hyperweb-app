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

      // Use getContractByIndex method available in hyperwebjs 1.1.1
      const response = await jsdQueryClient.hyperweb.hvm.getContractByIndex({
        index: BigInt(contractIndex),
      });
      return response;
    },
    enabled: !!contractIndex && enabled,
  });
};
