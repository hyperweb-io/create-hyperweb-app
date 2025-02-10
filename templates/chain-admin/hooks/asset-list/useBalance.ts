import { useChain } from '@interchain-kit/react';
import { defaultContext } from '@tanstack/react-query';
import { useGetBalance } from '@interchainjs/react/cosmos/bank/v1beta1/query.rpc.react';

import { useRpcEndpoint } from '../common';

export const useBalance = (
  chainName: string,
  enabled: boolean = true,
  displayDenom?: string
) => {
  const { address, assetList } = useChain(chainName);

  let denom = assetList?.assets[0].base!;
  for (const asset of assetList?.assets || []) {
    if (asset.display.toLowerCase() === displayDenom?.toLowerCase()) {
      denom = asset.base;
      break;
    }
  }

  const { data: rpcEndpoint, isFetching } = useRpcEndpoint(chainName);

  const isReady = !!address && !!rpcEndpoint;

  const balanceQuery = useGetBalance({
    request: {
      denom,
      address: address || '',
    },
    options: {
      enabled: isReady && enabled,
      select: ({ balance }) => balance,
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
    customizedQueryKey: ['balance', address, denom],
  });

  return {
    balance: balanceQuery.data,
    isLoading: isFetching || balanceQuery.isFetching,
  };
};
