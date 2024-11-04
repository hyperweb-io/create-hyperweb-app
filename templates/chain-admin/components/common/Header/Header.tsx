import Link from 'next/link';
import Image from 'next/image';
import { Box, useColorModeValue, useTheme } from '@interchain-ui/react';
import { RxHamburgerMenu } from 'react-icons/rx';

import { ChainDropdown } from './ChainDropdown';
import { Button } from '../Button';
import { useDetectBreakpoints, useAddHyperwebChain } from '@/hooks';
import { AddressButton } from './AddressButton';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header = ({ onOpenSidebar }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { isDesktop, isMobile } = useDetectBreakpoints();
  const { isHyperwebAdded } = useAddHyperwebChain();

  const brandLogo = useColorModeValue(
    '/logos/hyperweb-logo.svg',
    '/logos/hyperweb-logo-dark.svg'
  );

  const brandLogoSm = '/logos/hyperweb-logo-sm.svg';

  return (
    <Box
      display="flex"
      justifyContent={isDesktop ? 'flex-end' : 'space-between'}
      alignItems="center"
      mb="30px"
    >
      {!isDesktop && (
        <Link href="/">
          <Image
            src={isMobile ? brandLogoSm : brandLogo}
            alt="your logo"
            width="0"
            height="0"
            style={{ width: isMobile ? '30px' : '150px', height: 'auto' }}
          />
        </Link>
      )}
      <Box display="flex" alignItems="center" gap="10px">
        {isHyperwebAdded && <AddressButton />}
        {isHyperwebAdded && <ChainDropdown />}
        <Button
          leftIcon={theme === 'dark' ? 'moonLine' : 'sunLine'}
          px="10px"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        {!isDesktop && (
          <Box
            color="$blackAlpha400"
            cursor="pointer"
            ml="6px"
            attributes={{ onClick: onOpenSidebar }}
          >
            <RxHamburgerMenu size="22px" />
          </Box>
        )}
      </Box>
    </Box>
  );
};
