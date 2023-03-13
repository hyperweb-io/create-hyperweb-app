import '../style/test-style.css';

import { Chain } from '@chain-registry/types';
import { ChakraProvider } from '@chakra-ui/react';
import { Decimal } from '@cosmjs/math';
import { GasPrice } from '@cosmjs/stargate';
import { wallets as cosmostationWallets } from '@cosmos-kit/cosmostation';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { ChainProvider, defaultTheme } from '@cosmos-kit/react';
import { assets, chains } from 'chain-registry';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={defaultTheme}>
      <ChainProvider
        chains={chains}
        assetLists={assets}
        wallets={[...keplrWallets, ...cosmostationWallets, ...leapWallets]}
        walletConnectOptions={{
          signClient: {
            projectId: 'a8510432ebb71e6948cfd6cde54b70f7',
            relayUrl: 'wss://relay.walletconnect.org',
            metadata: {
              name: 'CosmosKit Template',
              description: 'CosmosKit dapp template',
              url: 'https://docs.cosmoskit.com/',
              icons: [],
            },
          },
        }}
        wrappedWithChakra={true}
        signerOptions={{
          signingStargate: (chain: Chain) => {
            switch (chain.chain_name) {
              case 'osmosis':
                return {
                  gasPrice: new GasPrice(Decimal.zero(1), 'uosmo'),
                };
              default:
                return void 0;
            }
          },
        }}
      >
        <Component {...pageProps} />
      </ChainProvider>
    </ChakraProvider>
  );
}

export default MyApp;