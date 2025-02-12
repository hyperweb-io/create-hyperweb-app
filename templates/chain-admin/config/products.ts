export type ProductCategory = 'cosmos-sdk' | 'frontend' | 'testing';

export type Product = {
  name: string;
  description: string;
  link: string;
  category: ProductCategory;
};

export const products: Product[] = [
  {
    name: 'Interchain Kit',
    description:
      'A wallet adapter for react with mobile WalletConnect support for the Cosmos ecosystem.',
    link: 'https://hyperweb.io/stack/interchain-kit',
    category: 'frontend',
  },
  {
    name: 'InterchainJS',
    description: 'A single, universal signing interface for any network',
    link: 'https://hyperweb.io/stack/interchainjs',
    category: 'frontend',
  },
  {
    name: 'Telescope',
    description:
      'A TypeScript Transpiler for Cosmos Protobufs to generate libraries for Cosmos blockchains.',
    link: 'https://hyperweb.io/stack/telescope',
    category: 'cosmos-sdk',
  },
  {
    name: 'Interchain UI',
    description:
      'A simple, modular and cross-framework component library for Cosmos ecosystem.',
    link: 'https://hyperweb.io/stack/interchain-ui',
    category: 'frontend',
  },
  {
    name: 'Chain Registry',
    description:
      'Get chain and asset list information from the npm package for the Official Cosmos chain registry.',
    link: 'https://hyperweb.io/stack/chain-registry',
    category: 'frontend',
  },
  {
    name: 'Starship',
    description:
      'Starship makes it easy to build a universal interchain development environment in k8s.',
    link: 'https://hyperweb.io/stack/starship',
    category: 'testing',
  },
  {
    name: 'Videos',
    description:
      'How-to videos from the official Cosmology website, with learning resources for building in Cosmos.',
    link: 'https://cosmology.zone/learn',
    category: 'frontend',
  },
  {
    name: 'Next.js',
    description: 'A React Framework supports hybrid static & server rendering.',
    link: 'https://nextjs.org/',
    category: 'frontend',
  },
];
