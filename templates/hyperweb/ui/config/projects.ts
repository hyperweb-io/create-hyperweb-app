export type Project = {
  name: string;
  desc: string;
  link: string;
}

export const products: Project[] = [
  {
    name: 'Interchain Kit',
    desc: 'A wallet adapter for react with mobile WalletConnect support for the Cosmos ecosystem.',
    link: 'https://github.com/hyperweb-io/interchain-kit',
  },
  {
    name: 'Telescope',
    desc: 'A TypeScript Transpiler for Cosmos Protobufs to generate libraries for Cosmos blockchains.',
    link: 'https://github.com/hyperweb-io/telescope',
  },
  {
    name: 'Chain Registry',
    desc: 'Get chain and asset list information from the npm package for the Official Cosmos chain registry.',
    link: 'https://github.com/hyperweb-io/chain-registry',
  },
  {
    name: 'Videos',
    desc: 'How-to videos from the official Cosmology website, with learning resources for building in Cosmos.',
    link: 'https://cosmology.zone/learn',
  },
];

export const dependencies: Project[] = [
  {
    name: 'Interchain UI',
    desc: 'A simple, modular and cross-framework Component Library for Cosmos',
    link: 'https://cosmology.zone/components',
  },
  {
    name: 'Next.js',
    desc: 'A React Framework supports hybrid static & server rendering.',
    link: 'https://nextjs.org/',
  },
];
