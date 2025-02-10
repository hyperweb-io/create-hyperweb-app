import { useMemo } from 'react';
import { useChain } from '@interchain-kit/react';
import { defaultContext } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useGetAllBalances } from '@interchainjs/react/cosmos/bank/v1beta1/query.rpc.react';
import { useGetDelegatorDelegations } from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react';

import { useChainUtils } from './useChainUtils';
import { useChainAssetsPrices } from './useChainAssetsPrices';
import { useRpcEndpoint } from '../common';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const getPagination = (limit: bigint) => ({
  limit,
  key: new Uint8Array(),
  offset: 0n,
  countTotal: true,
  reverse: false,
});

export const useTotalAssets = (chainName: string) => {
  const { address } = useChain(chainName);

  const { data: rpcEndpoint, isFetching } = useRpcEndpoint(chainName);

  const isReady = !!address && !!rpcEndpoint;

  const allBalancesQuery = useGetAllBalances({
    request: {
      address: address || '',
      pagination: getPagination(100n),
      resolveDenom: false,
    },
    options: {
      enabled: isReady,
      select: ({ balances }) => balances || [],
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
    customizedQueryKey: ['allBalances', address],
  });

  const delegationsQuery = useGetDelegatorDelegations({
    request: {
      delegatorAddr: address || '',
      pagination: getPagination(100n),
    },
    options: {
      enabled: isReady,
      select: ({ delegationResponses }) =>
        delegationResponses.map(({ balance }) => balance) || [],
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
    customizedQueryKey: ['delegations', address],
  });

  const pricesQuery = useChainAssetsPrices(chainName);

  const dataQueries = {
    prices: pricesQuery,
    allBalances: allBalancesQuery,
    delegations: delegationsQuery,
  };

  const queriesToRefetch = [dataQueries.allBalances];

  const queries = Object.values(dataQueries);
  const isInitialFetching = queries.some(({ isFetching }) => isFetching);
  const isRefetching = queries.some(({ isRefetching }) => isRefetching);
  const isLoading = isFetching || isInitialFetching || isRefetching;

  type AllQueries = typeof dataQueries;

  type QueriesData = {
    [Key in keyof AllQueries]: NonNullable<AllQueries[Key]['data']>;
  };

  const { calcCoinDollarValue } = useChainUtils(chainName);

  const zero = new BigNumber(0);

  const data = useMemo(() => {
    if (isLoading) return;

    const queriesData = Object.fromEntries(
      Object.entries(dataQueries).map(([key, query]) => [key, query.data])
    ) as QueriesData;

    const { allBalances, delegations, prices = {} } = queriesData;

    const stakedTotal = delegations
      ?.map((coin) => calcCoinDollarValue(prices, coin))
      .reduce((total, cur) => total.plus(cur), zero)
      .toString();

    const balancesTotal = allBalances
      ?.filter(({ denom }) => !denom.startsWith('gamm') && prices[denom])
      .map((coin) => calcCoinDollarValue(prices, coin))
      .reduce((total, cur) => total.plus(cur), zero)
      .toString();

    const total = [stakedTotal, balancesTotal]
      .reduce((total, cur) => total.plus(cur || 0), zero)
      .decimalPlaces(2)
      .toString();

    return {
      total,
      prices,
      allBalances,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const refetch = () => {
    queriesToRefetch.forEach((query) => query.refetch());
  };

  return { data, isLoading, refetch };
};
