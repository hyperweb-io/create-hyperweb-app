import { useState } from 'react';
import { useChain } from '@interchain-kit/react';
import BigNumber from 'bignumber.js';
import {
  BasicModal,
  StakingDelegate,
  Callout,
  Box,
  Button,
} from '@interchain-ui/react';
import { useUndelegate } from '@interchainjs/react/cosmos/staking/v1beta1/tx.rpc.react';
import { MsgUndelegate } from '@interchainjs/react/cosmos/staking/v1beta1/tx';
import { defaultContext } from '@tanstack/react-query';

import {
  Prices,
  UseDisclosureReturn,
  useSigningClient,
  useToastHandlers,
} from '@/hooks';
import {
  getExponentFromAsset,
  getNativeAsset,
  calcDollarValue,
  formatValidatorMetaInfo,
  getAssetLogoUrl,
  isGreaterThanZero,
  toBaseAmount,
  type ExtendedValidator as Validator,
} from '@/utils';
import { StdFee } from '@interchainjs/react/types';

export const UndelegateModal = ({
  updateData,
  unbondingDays,
  chainName,
  logoUrl,
  selectedValidator,
  closeOuterModal,
  modalControl,
  prices,
}: {
  updateData: () => void;
  unbondingDays: string;
  chainName: string;
  selectedValidator: Validator;
  closeOuterModal: () => void;
  modalControl: UseDisclosureReturn;
  logoUrl: string;
  prices: Prices;
}) => {
  const [amount, setAmount] = useState<number | undefined>(0);

  const { address, assetList } = useChain(chainName);

  const coin = getNativeAsset(assetList);
  const exp = getExponentFromAsset(coin);

  const toastHandlers = useToastHandlers();
  const { data: signingClient } = useSigningClient(chainName);
  const { mutate: undelegate, isLoading: isUndelegating } = useUndelegate({
    clientResolver: signingClient,
    options: {
      context: defaultContext,
      ...toastHandlers,
    },
  });

  const closeUndelegateModal = () => {
    setAmount(0);
    modalControl.onClose();
  };

  const onUndelegateClick = () => {
    if (!address || !amount) return;

    const msg = MsgUndelegate.fromPartial({
      delegatorAddress: address,
      validatorAddress: selectedValidator.address,
      amount: {
        amount: toBaseAmount(amount, exp),
        denom: coin.base,
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

    undelegate(
      {
        signerAddress: address,
        message: msg,
        fee,
        memo: 'Undelegate',
      },
      {
        onSuccess: () => {
          updateData();
          closeOuterModal();
          closeUndelegateModal();
        },
      }
    );
  };

  const maxAmount = selectedValidator.delegation;

  return (
    <BasicModal
      title="Undelegate"
      isOpen={modalControl.isOpen}
      onClose={closeUndelegateModal}
    >
      <Box width={{ mobile: '100%', tablet: '$containerSm' }}>
        <StakingDelegate
          header={{
            title: selectedValidator.name,
            subtitle: formatValidatorMetaInfo(selectedValidator),
            avatarUrl: logoUrl,
          }}
          headerExtra={
            unbondingDays && (
              <Callout
                title="Once the unbonding period begins you will:"
                intent="error"
                iconName="errorWarningLine"
              >
                <Box as="ul" ml="$9">
                  <Box as="li">not receive staking rewards</Box>
                  <Box as="li">not be able to cancel the unbonding</Box>
                  <Box as="li">
                    need to wait {unbondingDays} days for the amount to be
                    liquid
                  </Box>
                </Box>
              </Callout>
            )
          }
          delegationItems={[
            {
              label: 'Your Delegation',
              tokenAmount: selectedValidator.delegation,
              tokenName: coin.symbol,
            },
          ]}
          inputProps={{
            inputToken: {
              tokenName: coin.symbol,
              tokenIconUrl: getAssetLogoUrl(coin),
            },
            notionalValue: amount
              ? calcDollarValue(coin.base, amount, prices)
              : undefined,
            value: amount,
            minValue: 0,
            maxValue: Number(maxAmount),
            onValueChange: (val) => {
              setAmount(val);
            },
            // onValueInput: (val) => {
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
            // },
            partials: [
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
            ],
          }}
          footer={
            <Button
              intent="tertiary"
              onClick={onUndelegateClick}
              disabled={!isGreaterThanZero(amount) || isUndelegating}
              isLoading={isUndelegating}
            >
              Undelegate
            </Button>
          }
        />
      </Box>
    </BasicModal>
  );
};
