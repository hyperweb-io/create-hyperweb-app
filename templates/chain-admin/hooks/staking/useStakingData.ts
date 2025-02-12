import { useMemo } from 'react';
import { useChain } from '@interchain-kit/react';
import BigNumber from 'bignumber.js';
import {
  BondStatus,
  bondStatusToJSON,
} from '@interchainjs/react/cosmos/staking/v1beta1/staking';
import { useGetBalance } from '@interchainjs/react/cosmos/bank/v1beta1/query.rpc.react';
import {
  useGetDelegatorValidators,
  useGetDelegatorDelegations,
  useGetValidators,
  useGetParams as useStakingParams,
  useGetPool,
} from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react';
import {
  useGetDelegationTotalRewards,
  useGetParams as useDistributionParams,
} from '@interchainjs/react/cosmos/distribution/v1beta1/query.rpc.react';
import { useGetAnnualProvisions } from '@interchainjs/react/cosmos/mint/v1beta1/query.rpc.react';
import { defaultContext } from '@tanstack/react-query';

import { useAssetsPrices } from './useAssetsPrices';
import {
  shiftDigits,
  calcTotalDelegation,
  extendValidators,
  parseAnnualProvisions,
  parseDelegations,
  parseRewards,
  parseUnbondingDays,
  parseValidators,
  getNativeAsset,
  getExponentFromAsset,
} from '@/utils';
import { useRpcEndpoint } from '../common';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const useStakingData = (chainName: string) => {
  const { address, assetList } = useChain(chainName);

  const coin = getNativeAsset(assetList);
  const exp = getExponentFromAsset(coin);

  const { data: rpcEndpoint } = useRpcEndpoint(chainName);

  const isDataQueryEnabled = !!address && !!rpcEndpoint;

  const balanceQuery = useGetBalance({
    request: {
      address: address || '',
      denom: coin.base,
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ balance }) => shiftDigits(balance?.amount || '0', -exp),
      refetchOnMount: 'always',
    },
    clientResolver: rpcEndpoint,
  });

  const myValidatorsQuery = useGetDelegatorValidators({
    request: {
      delegatorAddr: address || '',
      pagination: undefined,
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ validators }) => parseValidators(validators),
    },
    clientResolver: rpcEndpoint,
  });

  const rewardsQuery = useGetDelegationTotalRewards({
    request: {
      delegatorAddress: address || '',
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: (data) => parseRewards(data, coin.base, -exp),
    },
    clientResolver: rpcEndpoint,
  });

  const validatorsQuery = useGetValidators({
    request: {
      status: bondStatusToJSON(BondStatus.BOND_STATUS_BONDED),
      pagination: {
        key: new Uint8Array(),
        offset: 0n,
        limit: 200n,
        countTotal: true,
        reverse: false,
      },
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ validators }) => {
        const sorted = validators.sort((a, b) =>
          new BigNumber(b.tokens).minus(a.tokens).toNumber()
        );
        return parseValidators(sorted);
      },
    },
    clientResolver: rpcEndpoint,
    customizedQueryKey: ['validators', chainName],
  });

  const delegationsQuery = useGetDelegatorDelegations({
    request: {
      delegatorAddr: address || '',
      pagination: {
        key: new Uint8Array(),
        offset: 0n,
        limit: 100n,
        countTotal: true,
        reverse: false,
      },
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ delegationResponses }) =>
        parseDelegations(delegationResponses, -exp),
    },
    clientResolver: rpcEndpoint,
  });

  const unbondingDaysQuery = useStakingParams({
    request: {},
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ params }) => parseUnbondingDays(params),
    },
    clientResolver: rpcEndpoint,
    customizedQueryKey: ['unbondingDays', chainName],
  });

  const annualProvisionsQuery = useGetAnnualProvisions({
    request: {},
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: parseAnnualProvisions,
      retry: false,
    },
    clientResolver: rpcEndpoint,
    customizedQueryKey: ['annualProvisions', chainName],
  });

  const poolQuery = useGetPool({
    request: {},
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ pool }) => pool,
    },
    clientResolver: rpcEndpoint,
    customizedQueryKey: ['pool', chainName],
  });

  const communityTaxQuery = useDistributionParams({
    request: {},
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ params }) => shiftDigits(params?.communityTax || '0', -18),
    },
    clientResolver: rpcEndpoint,
    customizedQueryKey: ['distributionParams', chainName],
  });

  const pricesQuery = useAssetsPrices();

  const allQueries = {
    balance: balanceQuery,
    myValidators: myValidatorsQuery,
    rewards: rewardsQuery,
    allValidators: validatorsQuery,
    delegations: delegationsQuery,
    unbondingDays: unbondingDaysQuery,
    annualProvisions: annualProvisionsQuery,
    pool: poolQuery,
    communityTax: communityTaxQuery,
    prices: pricesQuery,
  };

  const updatableQueriesAfterMutation = [
    allQueries.balance,
    allQueries.myValidators,
    allQueries.rewards,
    allQueries.allValidators,
    allQueries.delegations,
  ];

  const isInitialFetching = Object.values(allQueries).some(
    ({ isLoading }) => isLoading
  );

  const isRefetching = Object.values(allQueries).some(
    ({ isRefetching }) => isRefetching
  );

  const isLoading = isInitialFetching || isRefetching;

  type AllQueries = typeof allQueries;

  type QueriesData = {
    [Key in keyof AllQueries]: NonNullable<AllQueries[Key]['data']>;
  };

  const data = useMemo(() => {
    if (isLoading) return;

    const queriesData = Object.fromEntries(
      Object.entries(allQueries).map(([key, query]) => [key, query.data])
    ) as QueriesData;

    const {
      allValidators,
      delegations,
      rewards,
      myValidators,
      annualProvisions,
      communityTax,
      pool,
    } = queriesData;

    const chainMetadata = { annualProvisions, communityTax, pool };

    const extendedAllValidators = extendValidators(
      allValidators,
      delegations,
      rewards?.byValidators,
      chainMetadata
    );

    const extendedMyValidators = extendValidators(
      myValidators,
      delegations,
      rewards?.byValidators,
      chainMetadata
    );

    const totalDelegated = calcTotalDelegation(delegations);

    return {
      ...queriesData,
      allValidators: extendedAllValidators,
      myValidators: extendedMyValidators,
      totalDelegated,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const refetch = () => {
    updatableQueriesAfterMutation.forEach((query) => query.refetch());
  };

  return { data, isLoading, refetch };
};
