import '../styles/globals.css';
import '@interchain-ui/react/styles';

import type { AppProps } from 'next/app';
import { ChainProvider, InterchainWalletModal } from '@interchain-kit/react';
import { chains, assetLists } from 'chain-registry';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Box, Toaster, useTheme } from '@interchain-ui/react';
import { useMemo } from 'react';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { CustomThemeProvider, Layout } from '@/components';
import { wallets } from '@/config';
import { useStarshipChains } from '@/hooks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a separate component for the app content
function AppContent({ Component, pageProps }: AppProps) {
  const { themeClass } = useTheme();
  const { data: starshipData, isLoading } = useStarshipChains();
  console.log('starshipData', starshipData);

  // Merge chain-registry and starship chains
  const combinedChains = useMemo(() => {
    if (starshipData?.v2.chains) {
      return [...chains, ...starshipData.v2.chains];
    }
    return chains;
  }, [starshipData]);
  console.log('combinedChains', combinedChains);

  // Merge chain-registry and starship assetLists
  const combinedAssetLists = useMemo(() => {
    if (starshipData?.v2.assets) {
      return [...assetLists, ...starshipData.v2.assets];
    }
    return assetLists;
  }, [starshipData]);

  // Don't render ChainProvider until starship data is loaded
  if (isLoading) {
    return <div>Loading chains...</div>; // or your preferred loading component
  }

  return (
    <ChainProvider chains={combinedChains} assetLists={combinedAssetLists} wallets={wallets}
      walletModal={() => <InterchainWalletModal />}
    >
      <Box className={themeClass}>
        <Layout>
          <Component {...pageProps} />
          <Toaster position="top-right" closeButton={true} />
        </Layout>
      </Box>
    </ChainProvider>
  );
}

function CreateCosmosApp(props: AppProps) {
  return (
    <CustomThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent {...props} />
        {/* <ReactQueryDevtools /> */}
      </QueryClientProvider>
    </CustomThemeProvider>
  );
}

export default CreateCosmosApp;
