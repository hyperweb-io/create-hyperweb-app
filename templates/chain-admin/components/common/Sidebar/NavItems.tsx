import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Icon, IconName, Stack, Text } from '@interchain-ui/react';
import { RiHome7Line, RiStackLine } from 'react-icons/ri';
import { MdOutlineWaterDrop, MdOutlineHowToVote } from 'react-icons/md';
import { LuFileJson } from 'react-icons/lu';

type NavIcon = IconName | JSX.Element;

type NavItem = {
  icon: NavIcon;
  label: string;
  href: string;
};

export const ROUTES = {
  HOME: '/',
  STAKING: '/staking',
  GOVERNANCE: '/governance',
  ASSET_LIST: '/asset-list',
  FAUCET: '/faucet',
  CONTRACT: '/contract',
  DOCS: '/docs',
} as const;

const navItems: NavItem[] = [
  {
    icon: <RiHome7Line size="20px" />,
    label: 'Home',
    href: ROUTES.HOME,
  },
  {
    icon: <RiStackLine size="20px" />,
    label: 'Staking',
    href: ROUTES.STAKING,
  },
  {
    icon: <MdOutlineHowToVote size="20px" />,
    label: 'Governance',
    href: ROUTES.GOVERNANCE,
  },
  {
    icon: 'coinsLine',
    label: 'Asset List',
    href: ROUTES.ASSET_LIST,
  },
  {
    icon: <MdOutlineWaterDrop size="20px" />,
    label: 'Faucet',
    href: ROUTES.FAUCET,
  },
  {
    icon: <LuFileJson size="20px" />,
    label: 'Contract',
    href: ROUTES.CONTRACT,
  },
  {
    icon: 'document',
    label: 'Docs',
    href: ROUTES.DOCS,
  },
];

const NavItem = ({
  icon,
  label,
  href,
  onClick,
}: NavItem & { onClick?: () => void }) => {
  const router = useRouter();

  const isActive = router.pathname === href;

  return (
    <Link href={href}>
      <Box
        p="10px"
        display="flex"
        alignItems="center"
        gap="10px"
        height="40px"
        cursor="pointer"
        borderRadius="4px"
        color="$text"
        attributes={{ onClick }}
        backgroundColor={{
          hover: '$purple200',
          base: isActive ? '$purple200' : 'transparent',
        }}
      >
        {typeof icon === 'string' ? <Icon name={icon} size="$xl" /> : icon}
        <Text fontSize="$md" fontWeight="$medium">
          {label}
        </Text>
      </Box>
    </Link>
  );
};

export const NavItems = ({ onItemClick }: { onItemClick?: () => void }) => {
  return (
    <Stack direction="vertical" space="20px" attributes={{ width: '100%' }}>
      {navItems.map(({ href, icon, label }) => (
        <NavItem
          key={label}
          icon={icon}
          label={label}
          href={href}
          onClick={onItemClick}
        />
      ))}
    </Stack>
  );
};
