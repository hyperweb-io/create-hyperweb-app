import { useQuery } from '@tanstack/react-query';
import { useJsdQueryClient } from './useJsdQueryClient';

export const useQueryJsContract = ({
  contractIndex,
  fnName,
  arg,
  enabled = true,
}: {
  contractIndex: string;
  fnName: string;
  arg: string;
  enabled?: boolean;
}) => {
  const { data: jsdQueryClient } = useJsdQueryClient();

  return useQuery({
    queryKey: ['useQueryJsContract', contractIndex, fnName, arg],
    queryFn: async () => {
      if (!jsdQueryClient) return null;

      try {
        // Get contract information using getContractByIndex
        const contractInfo =
          await jsdQueryClient.hyperweb.hvm.getContractByIndex({
            index: BigInt(contractIndex),
          });

        if (!contractInfo) {
          throw new Error(`Contract not found for index ${contractIndex}`);
        }

        // For now, return contract information with a note about query limitations
        return {
          message: `JS contract querying is read-only via hyperwebjs query client. Contract ${contractIndex} exists.`,
          contractInfo: contractInfo,
          queryFunction: fnName,
          queryArgs: arg || 'empty',
          note: 'To perform state-changing operations, use the Execute Contract tab instead.',
          suggestion:
            'For read-only queries, consider calling view functions that return contract state without modifying it.',
        };
      } catch (error) {
        console.error('Error querying JS contract:', error);
        throw error;
      }
    },
    enabled: !!jsdQueryClient && !!contractIndex && !!fnName && enabled,
  });
};
