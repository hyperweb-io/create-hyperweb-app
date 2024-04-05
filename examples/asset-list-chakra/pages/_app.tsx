import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { SignerOptions, wallets } from 'cosmos-kit';
import { ChainProvider } from '@cosmos-kit/react';
import { assets, chains } from 'chain-registry';

import { GasPrice } from '@cosmjs/stargate';
import { aminoTypes, registry } from '../config/defaults';

import { ThemeProvider, defaultTheme } from '@cosmology-ui/react';
import '@interchain-ui/react/styles';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    signingStargate: () => {
      return {
        aminoTypes,
        registry,
      };
    },
    signingCosmwasm: (chain) => {
      switch (chain.chain_name) {
        case 'osmosis':
        case 'osmosistestnet':
          return {
            gasPrice: GasPrice.fromString('0.0025uosmo'),
          };
      }
    },
  };

  return (
    <ThemeProvider>
      <ChakraProvider theme={defaultTheme}>
        <ChainProvider
          chains={chains}
          assetLists={assets}
          wallets={wallets}
          walletConnectOptions={{
            signClient: {
              projectId: 'a8510432ebb71e6948cfd6cde54b70f7',
              relayUrl: 'wss://relay.walletconnect.org',
              metadata: {
                name: 'CosmosKit Template',
                description: 'CosmosKit dapp template',
                url: 'https://docs.cosmology.zone/cosmos-kit/',
                icons: [],
              },
            },
          }}
          signerOptions={signerOptions}
        >
          <QueryClientProvider client={queryClient}>
            {/* TODO fix type error */}
            {/* @ts-ignore */}
            <Component {...pageProps} />
          </QueryClientProvider>
        </ChainProvider>
      </ChakraProvider>
    </ThemeProvider>
  );
}

export default CreateCosmosApp;
