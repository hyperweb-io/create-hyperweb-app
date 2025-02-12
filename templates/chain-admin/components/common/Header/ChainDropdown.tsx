import Image from 'next/image';
import { useState } from 'react';
import { useChain, useWalletManager } from '@interchain-kit/react';
import { Box, Combobox, Skeleton, Stack, Text } from '@interchain-ui/react';

import { useStarshipChains, useDetectBreakpoints } from '@/hooks';
import { chainStore, useChainStore } from '@/contexts';

export const ChainDropdown = () => {
  const { selectedChain } = useChainStore();
  const { chain } = useChain(selectedChain);
  const [input, setInput] = useState<string>(chain.prettyName ?? '');
  const { data: starshipChains } = useStarshipChains();
  const { getChainLogoUrl } = useWalletManager();

  const { isMobile } = useDetectBreakpoints();

  return (
    <Combobox
      onInputChange={(input) => {
        setInput(input);
      }}
      selectedKey={selectedChain}
      onSelectionChange={(key) => {
        const chainName = key as string | null;
        if (chainName) {
          chainStore.setSelectedChain(chainName);
        }
      }}
      inputAddonStart={
        <Box display="flex" justifyContent="center" alignItems="center" px="$4">
          {input === chain.prettyName ? (
            <Image
              src={getChainLogoUrl(selectedChain) ?? ''}
              alt={chain.prettyName ?? ''}
              width={24}
              height={24}
              style={{
                borderRadius: '50%',
              }}
            />
          ) : (
            <Skeleton width="24px" height="24px" borderRadius="$full" />
          )}
        </Box>
      }
      styleProps={{
        width: isMobile ? '130px' : '260px',
      }}
    >
      {(starshipChains?.v2.chains ?? []).map((c) => (
        <Combobox.Item key={c.chainName} textValue={c.prettyName}>
          <Stack
            direction="horizontal"
            space={isMobile ? '$3' : '$4'}
            attributes={{ alignItems: 'center' }}
          >
            <Image
              src={getChainLogoUrl(c.chainName) ?? ''}
              alt={c.prettyName ?? ''}
              width={isMobile ? 18 : 24}
              height={isMobile ? 18 : 24}
              style={{
                borderRadius: '50%',
              }}
            />
            <Text fontSize={isMobile ? '12px' : '16px'} fontWeight="500">
              {c.prettyName}
            </Text>
          </Stack>
        </Combobox.Item>
      ))}
    </Combobox>
  );
};
