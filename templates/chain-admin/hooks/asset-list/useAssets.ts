import { useMemo } from 'react';
import { useChain } from '@interchain-kit/react';
import { defaultContext } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useGetAllBalances } from '@interchainjs/react/cosmos/bank/v1beta1/query.rpc.react';
import { Coin } from '@interchainjs/react/types';

import { PrettyAsset } from '@/components';
import { useChainUtils } from './useChainUtils';
import { useChainAssetsPrices } from './useChainAssetsPrices';
import { getPagination } from './useTotalAssets';
import { useRpcEndpoint } from '../common';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const useAssets = (chainName: string) => {
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

  const pricesQuery = useChainAssetsPrices(chainName);

  const dataQueries = {
    allBalances: allBalancesQuery,
    prices: pricesQuery,
  };

  const queriesToRefetch = [dataQueries.allBalances];

  const queries = Object.values(dataQueries);
  const isInitialFetching = queries.some(({ isLoading }) => isLoading);
  const isRefetching = queries.some(({ isRefetching }) => isRefetching);
  const isLoading = isFetching || isInitialFetching || isRefetching;

  type AllQueries = typeof dataQueries;

  type QueriesData = {
    [Key in keyof AllQueries]: NonNullable<AllQueries[Key]['data']>;
  };

  const {
    ibcAssets,
    getAssetByDenom,
    convRawToDispAmount,
    calcCoinDollarValue,
    denomToSymbol,
    getPrettyChainName,
  } = useChainUtils(chainName);

  const data = useMemo(() => {
    if (isLoading) return;

    const queriesData = Object.fromEntries(
      Object.entries(dataQueries).map(([key, query]) => [key, query.data])
    ) as QueriesData;

    const { allBalances, prices } = queriesData;

    const nativeAndIbcBalances: Coin[] = allBalances?.filter(
      ({ denom }) => !denom.startsWith('gamm') && prices[denom]
    );

    const emptyBalances: Coin[] = ibcAssets
      .filter(({ base }) => {
        const notInBalances = !nativeAndIbcBalances?.find(
          ({ denom }) => denom === base
        );
        return notInBalances && prices[base];
      })
      .map((asset) => ({ denom: asset.base, amount: '0' }))
      .reduce((acc: { denom: string; amount: string }[], current) => {
        if (!acc.some((balance) => balance.denom === current.denom)) {
          acc.push(current);
        }
        return acc;
      }, []);
    const finalAssets = [...(nativeAndIbcBalances ?? []), ...emptyBalances]
      .map(({ amount, denom }) => {
        const asset = getAssetByDenom(denom);
        const symbol = denomToSymbol(denom);
        const dollarValue = calcCoinDollarValue(prices, { amount, denom });
        return {
          symbol,
          logoUrl: asset.logo_URIs?.png || asset.logo_URIs?.svg,
          prettyChainName: getPrettyChainName(denom),
          displayAmount: convRawToDispAmount(denom, amount),
          dollarValue,
          amount,
          denom,
        };
      })
      .sort((a, b) =>
        new BigNumber(a.dollarValue).lt(b.dollarValue) ? 1 : -1
      );

    return {
      prices,
      allBalances,
      assets: finalAssets as PrettyAsset[],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const refetch = () => {
    queriesToRefetch.forEach((query) => query.refetch());
  };

  return { data, isLoading, refetch };
};
