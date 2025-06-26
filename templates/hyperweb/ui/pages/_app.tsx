import "../styles/globals.css";
import "@interchain-ui/react/styles";

import { keplrWallet } from "@interchain-kit/keplr-extension";
import { leapWallet } from "@interchain-kit/leap-extension";
import { ChainProvider } from "@interchain-kit/react";
import {
  Box,
  ThemeProvider,
  useColorModeValue,
  useTheme,
} from "@interchain-ui/react";
import { assetLists, chains } from "chain-registry";
import type { AppProps } from "next/app";

const chain = chains.find((chain) => chain.chainName === "cosmoshub")!;

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const { themeClass } = useTheme();

  return (
    <ThemeProvider>
      <ChainProvider
        chains={[{ ...chain }]}
        assetLists={assetLists}
        // @ts-ignore
        wallets={[keplrWallet, leapWallet]}
        // @ts-ignore
        signerOptions={{}}
        endpointOptions={{ endpoints: {} }}
      >
        <Box
          className={themeClass}
          minHeight="100dvh"
          backgroundColor={useColorModeValue("$white", "$background")}
        >
          {/* TODO fix type error */}
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </Box>
      </ChainProvider>
    </ThemeProvider>
  );
}

export default CreateCosmosApp;
