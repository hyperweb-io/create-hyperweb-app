import { useQuery } from '@tanstack/react-query';
import { getSmartContractState } from '@interchainjs/react/cosmwasm/wasm/v1/query.rpc.func';

import { useChainStore } from '@/contexts';
import { fromUint8Array, toUint8Array } from '@/utils';

import { useRpcEndpoint } from '../common';

export const useQueryContract = ({
  contractAddress,
  queryMsg,
  enabled = true,
}: {
  contractAddress: string;
  queryMsg: string;
  enabled?: boolean;
}) => {
  const { selectedChain } = useChainStore();
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);

  return useQuery({
    queryKey: ['useQueryContract', contractAddress, queryMsg],
    queryFn: async () => {
      if (!rpcEndpoint) {
        throw new Error('RPC endpoint is not available');
      }

      const parsedQueryMsg = queryMsg ? JSON.parse(queryMsg) : null;
      return getSmartContractState(rpcEndpoint, {
        address: contractAddress,
        queryData: parsedQueryMsg
          ? toUint8Array(parsedQueryMsg)
          : new Uint8Array(),
      });
    },
    select: ({ data }) => fromUint8Array(data),
    enabled: !!rpcEndpoint && !!contractAddress && !!queryMsg && enabled,
  });
};
