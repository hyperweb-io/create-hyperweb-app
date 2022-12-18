import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { defaultTheme, WalletProvider } from '@cosmos-kit/react';
import { ChakraProvider } from '@chakra-ui/react';
import { chainName } from '../config';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as cosmostationWallets } from '@cosmos-kit/cosmostation';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { wallets as vectisWallets } from '@cosmos-kit/vectis';

import { assets, chains } from 'chain-registry';
import { getSigningCosmosClientOptions } from 'juno-network';
import { GasPrice } from '@cosmjs/stargate';

import { SignerOptions } from '@cosmos-kit/core';
import { Chain } from '@chain-registry/types';

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    signingStargate: (_chain: Chain) => {
      return getSigningCosmosClientOptions();
    },
    signingCosmwasm: (chain: Chain) => {
      switch (chain.chain_name) {
        case 'juno':
          return {
            gasPrice: GasPrice.fromString('0.0025ujuno'),
          };
      }
    },
  };

  return (
    <ChakraProvider theme={defaultTheme}>
      <WalletProvider
        chains={chains}
        assetLists={assets}
        wallets={[
          ...keplrWallets,
          ...cosmostationWallets,
          ...leapWallets,
          ...vectisWallets,
        ]}
        signerOptions={signerOptions}
      >
        <Component {...pageProps} />
      </WalletProvider>
    </ChakraProvider>
  );
}

export default CreateCosmosApp;
