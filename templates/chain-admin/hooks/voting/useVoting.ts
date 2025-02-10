import { useChain } from '@interchain-kit/react';
import { Proposal } from '@interchainjs/react/cosmos/gov/v1/gov';
import { useVote } from '@interchainjs/react/cosmos/gov/v1beta1/tx.rpc.react';
import { MsgVote } from '@interchainjs/react/cosmos/gov/v1beta1/tx';
import { defaultContext } from '@tanstack/react-query';
import { StdFee } from '@interchainjs/react/types';

import { getNativeAsset } from '@/utils';
import { useSigningClient, useToastHandlers } from '../common';

export type useVotingOptions = {
  chainName: string;
  proposal: Proposal;
};

export type onVoteOptions = {
  option: number;
  success?: () => void;
  error?: () => void;
};

export function useVoting({ chainName, proposal }: useVotingOptions) {
  const { address, assetList } = useChain(chainName);
  const toastHandlers = useToastHandlers();
  const { data: signingClient } = useSigningClient(chainName);
  const { mutate: vote, isLoading: isVoting } = useVote({
    clientResolver: signingClient,
    options: {
      context: defaultContext,
      ...toastHandlers,
    },
  });

  const coin = getNativeAsset(assetList);

  async function onVote({
    option,
    success = () => {},
    error = () => {},
  }: onVoteOptions) {
    if (!address || !option) return;

    const msg = MsgVote.fromPartial({
      option,
      voter: address,
      proposalId: proposal.id,
    });

    const fee: StdFee = {
      amount: [
        {
          denom: coin.base,
          amount: '0',
        },
      ],
      gas: '100000',
    };

    vote(
      {
        signerAddress: address,
        message: msg,
        fee,
        memo: 'Vote',
      },
      {
        onSuccess: () => {
          success();
        },
        onError: (err) => {
          error();
          console.error(err);
        },
      }
    );
  }

  return { isVoting, onVote };
}
