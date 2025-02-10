import React, { useEffect, useMemo, useState } from 'react';
import { BasicModal, AssetWithdrawTokens } from '@interchain-ui/react';
import { useChainWallet, useWalletManager } from '@interchain-kit/react';
import BigNumber from 'bignumber.js';
import { useTransfer } from '@interchainjs/react/ibc/applications/transfer/v1/tx.rpc.react';
import { MsgTransfer } from '@interchainjs/react/ibc/applications/transfer/v1/tx';
import { defaultContext } from '@tanstack/react-query';
import { StdFee } from '@interchainjs/react/types';

import {
  useDisclosure,
  useChainUtils,
  useBalance,
  useToastHandlers,
  useSigningClient,
} from '@/hooks';
import { keplrWalletName } from '@/config';

import { PriceHash, TransferInfo, Transfer } from './types';

interface IProps {
  prices: PriceHash;
  transferInfo: TransferInfo;
  modalControl: ReturnType<typeof useDisclosure>;
  updateData: () => void;
  selectedChainName: string;
}

const TransferModalBody = (
  props: IProps & {
    inputValue: string;
    setInputValue: React.Dispatch<React.SetStateAction<string>>;
  }
) => {
  const {
    prices,
    selectedChainName,
    transferInfo,
    modalControl,
    updateData,
    inputValue,
    setInputValue,
  } = props;

  const { getIbcInfo, symbolToDenom, getExponentByDenom, convRawToDispAmount } =
    useChainUtils(selectedChainName);

  const {
    type: transferType,
    token: transferToken,
    destChainName,
    sourceChainName,
  } = transferInfo;

  const isDeposit = transferType === Transfer.Deposit;

  const {
    address: sourceAddress,
    connect: connectSourceChain,
    chain: sourceChainInfo,
  } = useChainWallet(sourceChainName, keplrWalletName);

  const {
    address: destAddress,
    connect: connectDestChain,
    chain: destChainInfo,
  } = useChainWallet(destChainName, keplrWalletName);

  const { balance, isLoading: isLoadingBalance } = useBalance(
    sourceChainName,
    isDeposit,
    transferInfo.token.symbol
  );

  const { getChainLogoUrl } = useWalletManager();

  const toastHandlers = useToastHandlers();
  const { data: signingClient } = useSigningClient(sourceChainName);
  const { mutate: transfer, isLoading } = useTransfer({
    clientResolver: signingClient,
    options: {
      context: defaultContext,
      ...toastHandlers,
    },
  });

  const availableAmount = useMemo(() => {
    if (!isDeposit) return transferToken.available ?? 0;
    if (isLoadingBalance) return 0;

    console.log('transferInfo.token', transferInfo.token);

    return new BigNumber(
      convRawToDispAmount(transferInfo.token.symbol, balance?.amount || '0')
    ).toNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDeposit,
    isLoading,
    transferToken.symbol,
    balance?.amount,
    transferInfo.token.symbol,
    isLoadingBalance,
  ]);

  const dollarValue = new BigNumber(1)
    .multipliedBy(
      prices[symbolToDenom(transferToken.symbol, transferInfo.sourceChainName)]
    )
    .decimalPlaces(6)
    .toNumber();

  useEffect(() => {
    if (!modalControl.isOpen) return;
    if (!sourceAddress) connectSourceChain();
    if (!destAddress) connectDestChain();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalControl.isOpen]);

  const sourceChain = useMemo(() => {
    return {
      name: sourceChainInfo.prettyName,
      address: sourceAddress ?? '',
      imgSrc: getChainLogoUrl(sourceChainName) ?? '',
    };
  }, [sourceAddress, sourceChainInfo, sourceChainName]);

  const destChain = useMemo(() => {
    return {
      symbol: destChainInfo.chainName.toUpperCase(),
      name: destChainInfo.prettyName,
      address: destAddress ?? '',
      imgSrc: getChainLogoUrl(destChainName) ?? '',
    };
  }, [destChainInfo, destAddress, destChainName]);

  const handleSubmitTransfer = async () => {
    if (!sourceAddress || !destAddress) return;

    const transferAmount = new BigNumber(inputValue)
      .shiftedBy(getExponentByDenom(symbolToDenom(transferToken.symbol)))
      .toString();

    const { sourcePort, sourceChannel } = getIbcInfo(
      sourceChainName,
      destChainName
    );

    const fee: StdFee = {
      amount: [{ denom: transferToken.denom ?? '', amount: '0' }],
      gas: '250000',
    };

    const token = {
      denom: transferToken.denom ?? '',
      amount: transferAmount,
    };

    const stamp = Date.now();
    const timeoutInNanos = (stamp + 1.2e6) * 1e6;

    const msg = MsgTransfer.fromPartial({
      sourcePort,
      sourceChannel,
      sender: sourceAddress,
      receiver: destAddress,
      token,
      timeoutHeight: undefined,
      timeoutTimestamp: BigInt(timeoutInNanos),
    });

    transfer(
      {
        signerAddress: sourceAddress,
        message: msg,
        fee,
        memo: 'Transfer',
      },
      {
        onSuccess: () => {
          updateData();
          modalControl.onClose();
        },
      }
    );
  };

  return (
    <AssetWithdrawTokens
      isDropdown={false}
      fromSymbol={transferInfo.token.symbol}
      fromName={sourceChain.name ?? ''}
      fromAddress={sourceChain.address}
      fromImgSrc={sourceChain.imgSrc}
      toName={destChain.name ?? ''}
      toAddress={destChain.address}
      toImgSrc={destChain.imgSrc}
      isSubmitDisabled={
        isLoading ||
        !inputValue ||
        new BigNumber(inputValue).isEqualTo(0) ||
        isNaN(Number(inputValue))
      }
      available={availableAmount}
      priceDisplayAmount={dollarValue}
      timeEstimateLabel="20 seconds"
      amount={inputValue}
      onChange={(value) => {
        console.log('onChange value', value);
        setInputValue(value);
      }}
      onTransfer={() => {
        console.log('onTransfer');
        handleSubmitTransfer();
      }}
      onCancel={() => {
        console.log('onCancel');
        modalControl.onClose();
      }}
    />
  );
};

export const RowTransferModal = (props: IProps) => {
  const { modalControl, transferInfo } = props;
  const [inputValue, setInputValue] = useState('');

  const closeModal = () => {
    modalControl.onClose();
    setInputValue('');
  };

  return (
    <BasicModal
      isOpen={modalControl.isOpen}
      title={transferInfo.type}
      onClose={() => closeModal()}
    >
      <TransferModalBody
        {...props}
        inputValue={inputValue}
        setInputValue={setInputValue}
        modalControl={{
          ...modalControl,
          onClose: closeModal,
        }}
      />
    </BasicModal>
  );
};
