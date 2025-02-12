import Image from 'next/image';
import { Box, Text, useColorModeValue } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';

import { Button } from '@/components';
import { useChainStore } from '@/contexts';
import { useDetectBreakpoints, useAddHyperwebChain } from '@/hooks';

export default function Home() {
  const { isMobile } = useDetectBreakpoints();
  const { isHyperwebAdded } = useAddHyperwebChain();

  const chainsImageSrc = useColorModeValue(
    '/images/chains.png',
    '/images/chains-dark.png'
  );

  return (
    <>
      <Text
        textAlign="center"
        fontSize="48px"
        fontWeight="500"
        attributes={{ mt: '200px', mb: '20px' }}
      >
        Create Hyperweb App
      </Text>
      <Text
        textAlign="center"
        fontSize="16px"
        fontWeight="500"
        attributes={{ mb: '20px' }}
      >
        Welcome to <HighlightText>Interchain Kit</HighlightText> +{' '}
        <HighlightText>Next.js</HighlightText>
      </Text>
      {isHyperwebAdded && <ConnectButton />}
      <Box
        display="flex"
        justifyContent="center"
        mt={isMobile ? '60px' : '100px'}
      >
        <Image
          alt="chains"
          src={chainsImageSrc}
          width={840}
          height={224}
          style={{
            maxWidth: '840px',
            width: '100%',
            height: 'auto',
          }}
        />
      </Box>
    </>
  );
}

const HighlightText = ({ children }: { children: string }) => {
  return (
    <Text as="span" color="$purple600" fontSize="inherit">
      {children}
    </Text>
  );
};

const ConnectButton = () => {
  const { selectedChain } = useChainStore();
  const { connect, address, openView } = useChain(selectedChain);

  return (
    <Button
      variant="primary"
      leftIcon="walletFilled"
      mx="auto"
      onClick={address ? openView : connect}
    >
      {address ? 'My Wallet' : 'Connect Wallet'}
    </Button>
  );
};
