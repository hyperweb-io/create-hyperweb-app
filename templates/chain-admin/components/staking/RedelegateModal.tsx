import { useState } from 'react';
import { useChain } from '@interchain-kit/react';
import {
  BasicModal,
  Box,
  Button,
  StakingDelegateCard,
  StakingDelegateInput,
  Text,
} from '@interchain-ui/react';
import BigNumber from 'bignumber.js';
import { useBeginRedelegate } from '@interchainjs/react/cosmos/staking/v1beta1/tx.rpc.react';
import { MsgBeginRedelegate } from '@interchainjs/react/cosmos/staking/v1beta1/tx';
import { defaultContext } from '@tanstack/react-query';
import { StdFee } from '@interchainjs/react/types';

import {
  calcDollarValue,
  getAssetLogoUrl,
  getExponentFromAsset,
  getNativeAsset,
  isGreaterThanZero,
  toBaseAmount,
  type ExtendedValidator as Validator,
} from '@/utils';
import {
  Prices,
  UseDisclosureReturn,
  useSigningClient,
  useToastHandlers,
} from '@/hooks';

export const RedelegateModal = ({
  updateData,
  chainName,
  modalControl,
  selectedValidator,
  validatorToRedelegate,
  prices,
}: {
  updateData: () => void;
  chainName: string;
  selectedValidator: Validator;
  validatorToRedelegate: Validator;
  modalControl: UseDisclosureReturn;
  prices: Prices;
}) => {
  const { address, assetList } = useChain(chainName);

  const [amount, setAmount] = useState<number | undefined>(0);

  const coin = getNativeAsset(assetList);
  const exp = getExponentFromAsset(coin);

  const toastHandlers = useToastHandlers();
  const { data: signingClient } = useSigningClient(chainName);
  const { mutate: beginRedelegate, isLoading: isRedelegating } =
    useBeginRedelegate({
      clientResolver: signingClient,
      options: {
        context: defaultContext,
        ...toastHandlers,
      },
    });

  const closeRedelegateModal = () => {
    setAmount(0);
    modalControl.onClose();
  };

  const onRedelegateClick = () => {
    if (!address || !amount) return;

    const msg = MsgBeginRedelegate.fromPartial({
      delegatorAddress: address,
      validatorSrcAddress: selectedValidator.address,
      validatorDstAddress: validatorToRedelegate.address,
      amount: {
        denom: coin.base,
        amount: toBaseAmount(amount, exp),
      },
    });

    const fee: StdFee = {
      amount: [
        {
          denom: coin.base,
          amount: '0',
        },
      ],
      gas: '200000',
    };

    beginRedelegate(
      {
        signerAddress: address,
        message: msg,
        fee,
        memo: 'Redelegate',
      },
      {
        onSuccess: () => {
          updateData();
          closeRedelegateModal();
        },
      }
    );
  };

  const maxAmount = selectedValidator.delegation;

  return (
    <BasicModal
      title="Redelegate"
      isOpen={modalControl.isOpen}
      onClose={closeRedelegateModal}
    >
      <Box width={{ mobile: '100%', tablet: '$containerSm' }} mt="$6">
        <RedelegateLabel
          type="from"
          validatorName={selectedValidator?.name}
          mb="20px"
        />

        <StakingDelegateCard
          label="Your Delegation"
          tokenAmount={selectedValidator?.delegation}
          tokenName={coin.symbol}
          attributes={{ mb: '$12' }}
        />

        <RedelegateLabel
          type="to"
          validatorName={validatorToRedelegate.name}
          mb="20px"
        />

        <StakingDelegateInput
          inputToken={{
            tokenName: coin.symbol,
            tokenIconUrl: getAssetLogoUrl(coin),
          }}
          minValue={0}
          maxValue={Number(maxAmount)}
          value={amount}
          notionalValue={
            amount ? calcDollarValue(coin.base, amount, prices) : undefined
          }
          onValueChange={(val) => {
            setAmount(val);
          }}
          // onValueInput={(val) => {
          //   if (!val) {
          //     setAmount(undefined);
          //     return;
          //   }

          //   if (new BigNumber(val).gt(maxAmount)) {
          //     setAmount(Number(maxAmount));
          //     forceUpdate((n) => n + 1);
          //     return;
          //   }

          //   setAmount(Number(val));
          // }}
          partials={[
            {
              label: '1/2',
              onClick: () => {
                setAmount(new BigNumber(maxAmount).dividedBy(2).toNumber());
              },
            },
            {
              label: '1/3',
              onClick: () => {
                setAmount(new BigNumber(maxAmount).dividedBy(3).toNumber());
              },
            },
            {
              label: 'Max',
              onClick: () => setAmount(Number(maxAmount)),
            },
          ]}
        />
      </Box>

      <Box mt="$12">
        <Button
          intent="tertiary"
          onClick={onRedelegateClick}
          isLoading={isRedelegating}
          disabled={!isGreaterThanZero(amount) || isRedelegating}
          fluidWidth
        >
          Redelegate
        </Button>
      </Box>
    </BasicModal>
  );
};

const RedelegateLabel = ({
  type,
  validatorName,
  mb,
}: {
  type: 'from' | 'to';
  validatorName: string;
  mb?: string;
}) => {
  return (
    <Text fontSize="$md" attributes={{ mb }}>
      {type === 'from' ? 'From' : 'To'}&nbsp;
      <Text as="span" fontSize="$md" fontWeight="$semibold">
        {validatorName}
      </Text>
    </Text>
  );
};
