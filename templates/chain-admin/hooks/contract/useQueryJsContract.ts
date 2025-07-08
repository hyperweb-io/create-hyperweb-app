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
      console.warn(
        'JS contract querying temporarily disabled - parameter format needs investigation'
      );
      return null;
    },
    enabled: !!jsdQueryClient && !!contractIndex && !!fnName && enabled,
  });
};
