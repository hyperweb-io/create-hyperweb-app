import { useEffect, useMemo, useState } from 'react';
import { useChain } from '@interchain-kit/react';
import { defaultContext, useQueries } from '@tanstack/react-query';
import { ProposalStatus } from '@interchainjs/react/cosmos/gov/v1beta1/gov';
import { createGetVote } from '@interchainjs/react/cosmos/gov/v1beta1/query.rpc.func';
import { Proposal as ProposalV1 } from '@interchainjs/react/cosmos/gov/v1/gov';
import { chains } from 'chain-registry';
import {
  useGetProposals,
  useGetParams as useGovParams,
} from '@interchainjs/react/cosmos/gov/v1/query.rpc.react';
import { useGetPool } from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react';

import { getTitle, paginate, parseQuorum } from '@/utils';
import { useRpcEndpoint } from '../common';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export interface Votes {
  [key: string]: number;
}

export function processProposals(proposals: ProposalV1[]) {
  const sorted = proposals.sort((a, b) => Number(b.id) - Number(a.id));

  proposals.forEach((proposal) => {
    // @ts-ignore
    if (!proposal.content?.title && proposal.content?.value) {
      // @ts-ignore
      proposal.content.title = getTitle(proposal.content?.value);
    }
  });

  return sorted
    .filter(
      ({ status }) => status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
    )
    .concat(
      sorted.filter(
        ({ status }) => status !== ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
      )
    );
}

export function useVotingData(chainName: string) {
  const [isLoading, setIsLoading] = useState(false);

  const { address } = useChain(chainName);
  const { data: rpcEndpoint, isFetching } = useRpcEndpoint(chainName);

  const getVote = createGetVote(rpcEndpoint);
  const chain = chains.find((c) => c.chain_name === chainName);
  const isReady = !!address && !!rpcEndpoint;

  const proposalsQuery = useGetProposals({
    request: {
      voter: '',
      depositor: '',
      pagination: paginate(50n, true),
      proposalStatus: ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED,
    },
    options: {
      enabled: isReady,
      staleTime: Infinity,
      select: ({ proposals }) => processProposals(proposals),
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
  });

  const bondedTokensQuery = useGetPool({
    request: {},
    options: {
      enabled: isReady,
      staleTime: Infinity,
      select: ({ pool }) => pool?.bondedTokens,
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
  });

  const quorumQuery = useGovParams({
    request: { paramsType: 'tallying' },
    options: {
      enabled: isReady,
      staleTime: Infinity,
      select: ({ tallyParams }) => parseQuorum(tallyParams?.quorum as any),
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
  });

  const votedProposalsQuery = useGetProposals({
    request: {
      voter: address || '/', // use '/' to differentiate from proposalsQuery
      depositor: '',
      pagination: paginate(50n, true),
      proposalStatus: ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED,
    },
    options: {
      enabled: isReady && Boolean(address),
      select: ({ proposals }) => proposals,
      keepPreviousData: true,
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
  });

  const votesQueries = useQueries({
    queries: (votedProposalsQuery.data || []).map(({ id }) => ({
      queryKey: ['voteQuery', id, address],
      queryFn: () =>
        getVote({
          proposalId: id,
          voter: address || '',
        }),
      enabled: isReady && !!votedProposalsQuery.data,
      keepPreviousData: true,
    })),
  });

  const singleQueries = {
    quorum: quorumQuery,
    proposals: proposalsQuery,
    bondedTokens: bondedTokensQuery,
    votedProposals: votedProposalsQuery,
  };

  const staticQueries = [
    singleQueries.quorum,
    singleQueries.proposals,
    singleQueries.bondedTokens,
  ];

  const dynamicQueries = [singleQueries.votedProposals];

  useEffect(() => {
    staticQueries.forEach((query) => query.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName]);

  const isStaticQueriesFetching = staticQueries.some(
    ({ isFetching }) => isFetching
  );

  const isDynamicQueriesFetching =
    singleQueries.votedProposals.isFetching ||
    votesQueries.some(({ isFetching }) => isFetching);

  const loading =
    isFetching || isStaticQueriesFetching || isDynamicQueriesFetching;

  useEffect(() => {
    // no loading when refetching
    if (isFetching || isStaticQueriesFetching) setIsLoading(true);
    if (!loading) setIsLoading(false);
  }, [isStaticQueriesFetching, loading]);

  type SingleQueries = typeof singleQueries;

  type SingleQueriesData = {
    [Key in keyof SingleQueries]: NonNullable<SingleQueries[Key]['data']>;
  };

  const singleQueriesData = useMemo(() => {
    if (isStaticQueriesFetching || !isReady) return;

    const singleQueriesData = Object.fromEntries(
      Object.entries(singleQueries).map(([key, query]) => [key, query.data])
    ) as SingleQueriesData;

    singleQueriesData?.proposals.forEach((proposal) => {
      if (proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
        (async () => {
          for (const { address } of chain?.apis?.rest || []) {
            const api = `${address}/cosmos/gov/v1/proposals/${Number(
              proposal.id
            )}/tally`;
            try {
              const tally = (await (await fetch(api)).json()).tally;
              if (!tally) {
                continue;
              }
              proposal.finalTallyResult = {
                yesCount: tally.yes_count,
                noCount: tally.no_count,
                abstainCount: tally.abstain_count,
                noWithVetoCount: tally.no_with_veto_count,
              };
              break;
            } catch (e) {
              console.error('error fetch tally', api);
            }
          }
        })();
      }
    });

    return singleQueriesData;
  }, [isStaticQueriesFetching, isReady]);

  const votes = useMemo(() => {
    const votesEntries = votesQueries
      .map((query) => query.data)
      .map((data) => [data?.vote?.proposalId, data?.vote?.options[0].option]);

    return Object.fromEntries(votesEntries) as Votes;
  }, [votesQueries]);

  const refetch = () => {
    votesQueries.forEach((query) => query.remove());
    dynamicQueries.forEach((query) => query.refetch());
  };

  return { data: { ...singleQueriesData, votes }, isLoading, refetch };
}
