import { defaultContext } from '@tanstack/react-query';
import { useGetContractInfo } from '@interchainjs/react/cosmwasm/wasm/v1/query.rpc.react';

import { useChainStore } from '@/contexts';
import { useRpcEndpoint } from '../common';

export const useContractInfo = ({
  contractAddress,
  enabled = true,
}: {
  contractAddress: string;
  enabled?: boolean;
}) => {
  const { selectedChain } = useChainStore();
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);

  return useGetContractInfo({
    request: {
      address: contractAddress,
    },
    options: {
      enabled: !!contractAddress && !!rpcEndpoint && enabled,
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
  });
};
