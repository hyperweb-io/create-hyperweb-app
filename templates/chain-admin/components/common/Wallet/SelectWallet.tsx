import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';
import { Box, Text, useColorModeValue } from '@interchain-ui/react';
import { Wallet } from '@interchain-kit/core';

import { darkColors, lightColors, wallets } from '@/config';
import { getWalletLogo } from '@/utils';

export const SelectWallet = ({
  setSelectedWalletName,
}: {
  setSelectedWalletName: Dispatch<SetStateAction<string | null>>;
}) => {
  const handleSelectWallet = (wallet: Wallet) => () => {
    setSelectedWalletName(wallet.name);
  };

  const boxShadowColor = useColorModeValue(
    lightColors?.blackAlpha200 as string,
    darkColors?.blackAlpha200 as string
  );

  return (
    <Box
      display="flex"
      width="208px"
      p="10px"
      flexDirection="column"
      gap="10px"
      borderRadius="6px"
      boxShadow={`0px 0px 20px 0px ${boxShadowColor}`}
      bg="$background"
    >
      {wallets.map((w) => (
        <Box
          display="flex"
          width="100%"
          p="10px"
          justifyContent="space-between"
          alignItems="center"
          borderRadius="6px"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="$blackAlpha200"
          backgroundColor={{ base: '$background', hover: '$blackAlpha100' }}
          cursor="pointer"
          attributes={{ onClick: handleSelectWallet(w.info!) }}
          key={w.info?.name}
        >
          <Text color="$blackAlpha600" fontSize="14px" fontWeight="500">
            {w.info?.prettyName}
          </Text>
          <Image
            src={getWalletLogo(w?.info)}
            alt={w?.info?.prettyName ?? ''}
            width="0"
            height="0"
            style={{ width: '20px', height: 'auto' }}
          />
        </Box>
      ))}
    </Box>
  );
};
