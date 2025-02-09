import { useState } from 'react';
import { StdFee } from '@interchainjs/cosmos-types/types';
import { useChain } from '@interchain-kit/react';
import BigNumber from 'bignumber.js';
import {
  BasicModal,
  StakingDelegate,
  Box,
  Button,
  Callout,
  Text,
} from '@interchain-ui/react';
import { useDelegate } from '@interchainjs/react/cosmos/staking/v1beta1/tx.rpc.react';
import { MsgDelegate } from '@interchainjs/react/cosmos/staking/v1beta1/tx';
import { defaultContext } from '@tanstack/react-query';

import {
  type ExtendedValidator as Validator,
  formatValidatorMetaInfo,
  getAssetLogoUrl,
  isGreaterThanZero,
  calcDollarValue,
  toBaseAmount,
  getExponentFromAsset,
  getNativeAsset,
  convertGasToTokenAmount,
} from '@/utils';
import {
  Prices,
  UseDisclosureReturn,
  useSigningClient,
  useToastHandlers,
} from '@/hooks';

const DEFAULT_DELEGATION_GAS = '200000';

export const DelegateModal = ({
  balance,
  updateData,
  unbondingDays,
  chainName,
  logoUrl,
  modalControl,
  selectedValidator,
  closeOuterModal,
  prices,
  modalTitle,
  showDescription = true,
}: {
  balance: string;
  updateData: () => void;
  unbondingDays: string;
  chainName: string;
  modalControl: UseDisclosureReturn;
  selectedValidator: Validator;
  logoUrl: string;
  prices: Prices;
  closeOuterModal?: () => void;
  modalTitle?: string;
  showDescription?: boolean;
}) => {
  const { isOpen, onClose } = modalControl;
  const { address, assetList, chain } = useChain(chainName);

  const [amount, setAmount] = useState<number | undefined>(0);

  const coin = getNativeAsset(assetList);
  const exp = getExponentFromAsset(coin);

  const toastHandlers = useToastHandlers();
  const { data: signingClient } = useSigningClient(chainName);
  const { mutate: delegate, isLoading: isDelegating } = useDelegate({
    clientResolver: signingClient,
    options: {
      context: defaultContext,
      ...toastHandlers,
    },
  });

  const onModalClose = () => {
    onClose();
    setAmount(0);
  };

  const onDelegateClick = () => {
    if (!address || !amount) return;

    const msg = MsgDelegate.fromPartial({
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
      gas: DEFAULT_DELEGATION_GAS,
    };

    delegate(
      {
        signerAddress: address,
        message: msg,
        fee,
        memo: 'Delegate',
      },
      {
        onSuccess: () => {
          closeOuterModal?.();
          updateData();
          onModalClose();
        },
      }
    );
  };

  const handleMaxClick = () => {
    const feeAmount = convertGasToTokenAmount(
      DEFAULT_DELEGATION_GAS,
      chain,
      exp
    );
    const balanceAfterFee = Math.max(
      new BigNumber(balance).minus(feeAmount).toNumber(),
      0
    );
    setAmount(balanceAfterFee);
  };

  const headerExtra = (
    <>
      {showDescription && selectedValidator.description && (
        <Text fontSize="$md">{selectedValidator.description}</Text>
      )}
      {unbondingDays && (
        <Callout
          title={`Staking will lock your funds for ${unbondingDays} days`}
          intent="error"
          iconName="errorWarningLine"
        >
          You will need to undelegate in order for your staked assets to be
          liquid again. This process will take {unbondingDays} days to complete.
        </Callout>
      )}
    </>
  );

  return (
    <BasicModal
      title={modalTitle || 'Delegate'}
      isOpen={isOpen}
      onClose={onModalClose}
    >
      <Box width={{ mobile: '100%', tablet: '$containerSm' }}>
        <StakingDelegate
          header={{
            title: selectedValidator.name,
            subtitle: formatValidatorMetaInfo(selectedValidator),
            avatarUrl: logoUrl,
          }}
          headerExtra={headerExtra}
          delegationItems={[
            {
              label: 'Your Delegation',
              tokenAmount: selectedValidator.delegation,
              tokenName: coin.symbol,
            },
            {
              label: 'Available to Delegate',
              tokenAmount: balance,
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
            minValue: 0,
            maxValue: Number(balance),
            value: amount,
            onValueChange: (val) => {
              setAmount(val);
            },
            partials: [
              {
                label: '1/2',
                onClick: () => {
                  const newAmount = new BigNumber(balance)
                    .dividedBy(2)
                    .toNumber();
                  setAmount(newAmount);
                },
              },
              {
                label: '1/3',
                onClick: () => {
                  const newAmount = new BigNumber(balance)
                    .dividedBy(3)
                    .toNumber();

                  setAmount(newAmount);
                },
              },
              {
                label: 'Max',
                onClick: handleMaxClick,
              },
            ],
          }}
          footer={
            <Button
              intent="tertiary"
              onClick={onDelegateClick}
              disabled={!isGreaterThanZero(amount) || isDelegating}
              isLoading={isDelegating}
            >
              Delegate
            </Button>
          }
        />
      </Box>
    </BasicModal>
  );
};
