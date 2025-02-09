import {
  Box,
  StakingAssetHeader,
  StakingClaimHeader,
} from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';
import { useWithdrawDelegatorReward } from '@interchainjs/react/cosmos/distribution/v1beta1/tx.rpc.react';
import { MsgWithdrawDelegatorReward } from '@interchainjs/react/cosmos/distribution/v1beta1/tx';
import { defaultContext } from '@tanstack/react-query';

import { Prices, useSigningClient, useToastHandlers } from '@/hooks';
import {
  sum,
  getNativeAsset,
  calcDollarValue,
  isGreaterThanZero,
  type ParsedRewards as Rewards,
} from '@/utils';
import { StdFee } from '@interchainjs/react/types';

const Overview = ({
  balance,
  rewards,
  staked,
  updateData,
  chainName,
  prices,
}: {
  balance: string;
  rewards: Rewards;
  staked: string;
  updateData: () => void;
  chainName: string;
  prices: Prices;
}) => {
  const { address, assetList } = useChain(chainName);

  const toastHandlers = useToastHandlers();
  const { data: signingClient } = useSigningClient(chainName);
  const { mutate: withdrawDelegatorReward, isLoading: isClaiming } =
    useWithdrawDelegatorReward({
      clientResolver: signingClient,
      options: {
        context: defaultContext,
        ...toastHandlers,
      },
    });

  const totalAmount = sum(balance, staked, rewards?.total ?? 0);
  const coin = getNativeAsset(assetList);

  const onClaimRewardClick = async () => {
    if (!address) return;

    const msgs = rewards.byValidators.map(({ validatorAddress }) =>
      MsgWithdrawDelegatorReward.fromPartial({
        delegatorAddress: address,
        validatorAddress,
      })
    );

    const fee: StdFee = {
      amount: [
        {
          denom: coin.base,
          amount: '0',
        },
      ],
      gas: '200000',
    };

    withdrawDelegatorReward(
      {
        signerAddress: address,
        message: msgs,
        fee,
        memo: 'Claim reward',
      },
      {
        onSuccess: updateData,
      }
    );
  };

  return (
    <>
      <Box mb={{ mobile: '$8', tablet: '$12' }}>
        <StakingAssetHeader
          imgSrc={coin.logoURIs?.png || coin.logoURIs?.svg || ''}
          symbol={coin.symbol}
          totalAmount={Number(totalAmount || 0)}
          totalPrice={calcDollarValue(coin.base, totalAmount, prices)}
          available={Number(balance || 0)}
          availablePrice={calcDollarValue(coin.base, balance, prices)}
        />
      </Box>

      <Box mb={{ mobile: '$12', tablet: '$14' }}>
        <StakingClaimHeader
          symbol={coin.symbol}
          rewardsAmount={Number(rewards?.total || 0)}
          stakedAmount={Number(staked || 0)}
          onClaim={onClaimRewardClick}
          isLoading={isClaiming}
          isDisabled={!isGreaterThanZero(rewards?.total || 0)}
        />
      </Box>
    </>
  );
};

export default Overview;
