import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { Box, Icon, Text, useColorModeValue } from '@interchain-ui/react';
import { useChainWallet } from '@interchain-kit/react';
import { Wallet, WalletState } from '@interchain-kit/core';

import { darkColors, lightColors } from '@/config';
import { getWalletLogo } from '@/utils';
import { RingLoader } from './RingLoader';
import { useChainStore } from '@/contexts';

export const Connecting = ({
  selectedWalletName,
  clearSelectedWallet,
}: {
  selectedWalletName: string;
  clearSelectedWallet: () => void;
}) => {
  const { selectedChain } = useChainStore();

  const { wallet, connect, status, message } = useChainWallet(
    selectedChain,
    selectedWalletName
  );

  useEffect(() => {
    connect();
  }, []);

  const content = useMemo(() => {
    // if (status === WalletStatus.NotExist) {
    //   return (
    //     <>
    //       <WalletLogoWithRing wallet={walletInfo} intent="warning" />
    //       <StatusText>{walletInfo.prettyName} Not Installed</StatusText>
    //       {downloadInfo?.link && (
    //         <Link href={downloadInfo.link} target="_blank">
    //           <Button
    //             leftIcon="arrowDownload"
    //             fontSize="14px"
    //             color="$blackAlpha600"
    //           >
    //             Install {walletInfo.prettyName}
    //           </Button>
    //         </Link>
    //       )}
    //     </>
    //   );
    // }

    if (status === WalletState.Connecting) {
      return (
        <>
          <WalletLogoWithRing wallet={wallet.info} intent="connecting" />
          <StatusText>Requesting Connection</StatusText>
        </>
      );
    }

    if (status === WalletState.Rejected) {
      return (
        <>
          <WalletLogoWithRing wallet={wallet.info} intent="warning" />
          <StatusText>Request Rejected</StatusText>
        </>
      );
    }

    return (
      <>
        <WalletLogoWithRing wallet={wallet.info} intent="warning" />
        <StatusText>Connection Error</StatusText>
        {message && <StatusDescription>{message}</StatusDescription>}
      </>
    );
  }, [wallet.info, status, message]);

  const boxShadowColor = useColorModeValue(
    lightColors?.blackAlpha200 as string,
    darkColors?.blackAlpha200 as string
  );

  return (
    <Box
      display="flex"
      width="208px"
      p="20px"
      flexDirection="column"
      alignItems="center"
      gap="16px"
      borderRadius="6px"
      boxShadow={`0px 0px 20px 0px ${boxShadowColor}`}
      bg="$background"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
      >
        <Box
          cursor="pointer"
          attributes={{ onClick: clearSelectedWallet }}
          display="flex"
          alignItems="center"
        >
          <Icon name="arrowLeftSLine" color="$blackAlpha500" size="$xl" />
        </Box>
        <Text color="$blackAlpha600" fontSize="16px" fontWeight="600">
          {wallet.info.prettyName}
        </Text>
        <Icon
          size="$xl"
          name="arrowLeftSLine"
          color="$blackAlpha500"
          attributes={{ opacity: '0' }}
        />
      </Box>
      {content}
    </Box>
  );
};

const StatusText = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text color="$blackAlpha600" fontSize="14px" fontWeight="600">
      {children}
    </Text>
  );
};

const StatusDescription = ({ children }: { children: React.ReactNode }) => {
  return (
    <Text
      color="$blackAlpha600"
      fontSize="12px"
      fontWeight="400"
      textAlign="center"
    >
      {children}
    </Text>
  );
};

const WalletLogoWithRing = ({
  wallet,
  intent,
}: {
  wallet: Wallet;
  intent: 'connecting' | 'warning';
}) => {
  const isConnecting = intent === 'connecting';

  return (
    <Box color="$blue400" position="relative">
      <RingLoader
        angle={isConnecting ? 80 : 360}
        radius={55}
        isSpinning={isConnecting}
      >
        <Image
          src={getWalletLogo(wallet)}
          alt={wallet.prettyName}
          width="0"
          height="0"
          style={{ width: '40px', height: 'auto' }}
        />
      </RingLoader>
      {!isConnecting && (
        <Box
          width="30px"
          height="30px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderWidth="1px"
          borderStyle="$solid"
          borderColor="$blue600"
          borderRadius="$full"
          bg="$blue100"
          position="absolute"
          right="2px"
          bottom="2px"
        >
          <Text color="$blue600" fontSize="$2xl" fontWeight="600">
            !
          </Text>
        </Box>
      )}
    </Box>
  );
};
