import Image from 'next/image';
import { Box, Icon, Text, useColorModeValue } from '@interchain-ui/react';
import { FiLogOut } from 'react-icons/fi';
import { useChainWallet } from '@interchain-kit/react';

import { darkColors, lightColors } from '@/config';
import { useCopyToClipboard } from '@/hooks';
import { getWalletLogo, shortenAddress } from '@/utils';
import { useChainStore } from '@/contexts';

export const Connected = ({
  selectedWalletName,
  clearSelectedWallet,
}: {
  selectedWalletName: string;
  clearSelectedWallet: () => void;
}) => {
  const { selectedChain } = useChainStore();

  const { wallet, disconnect, address } = useChainWallet(
    selectedChain,
    selectedWalletName
  );

  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const boxShadowColor = useColorModeValue(
    lightColors?.blackAlpha200 as string,
    darkColors?.blackAlpha200 as string
  );

  if (!address) return null;

  return (
    <Box
      p="10px"
      display="flex"
      alignItems="center"
      gap="10px"
      borderRadius="8px"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="$blackAlpha100"
      bg="$background"
      boxShadow={`0px 0px 20px 0px ${boxShadowColor}`}
    >
      <Box display="flex" alignItems="center" gap="4px">
        {wallet && (
          <Image
            src={getWalletLogo(wallet.info)}
            alt={wallet.info.prettyName}
            width="0"
            height="0"
            style={{ width: '20px', height: 'auto' }}
          />
        )}
        <Text
          color="$blackAlpha500"
          fontSize="14px"
          fontWeight="500"
          lineHeight="20px"
        >
          {shortenAddress(address)}
        </Text>
      </Box>
      <Box
        cursor="pointer"
        display="flex"
        alignItems="center"
        attributes={{ onClick: () => copyToClipboard(address) }}
      >
        <Icon
          name={isCopied ? 'checkLine' : 'copy'}
          size="$lg"
          color={isCopied ? '$green600' : '$blackAlpha400'}
        />
      </Box>
      <Box
        color="$blackAlpha400"
        display="flex"
        alignItems="center"
        cursor="pointer"
        attributes={{
          onClick: () => {
            clearSelectedWallet();
            disconnect();
          },
        }}
      >
        <FiLogOut size="18px" />
      </Box>
    </Box>
  );
};
