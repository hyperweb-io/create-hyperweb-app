import { useQuery } from '@tanstack/react-query';
import { getCode } from '@interchainjs/react/cosmwasm/wasm/v1/query.rpc.func';

import { prettyCodeInfo } from '@/utils';
import { useChainStore } from '@/contexts';
import { useRpcEndpoint } from '../common';

export const useCodeDetails = (codeId: number, enabled: boolean = true) => {
  const { selectedChain } = useChainStore();
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);

  return useQuery({
    queryKey: ['useCodeDetails', codeId],
    queryFn: async () => {
      try {
        const response = await getCode(rpcEndpoint!, {
          codeId: BigInt(codeId),
        });
        return response.codeInfo && prettyCodeInfo(response.codeInfo);
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    enabled: !!rpcEndpoint && enabled,
    retry: false,
    cacheTime: 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
};
