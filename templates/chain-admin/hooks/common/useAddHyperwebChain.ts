import { useEffect } from 'react';
import { useWalletManager } from '@interchain-kit/react';

import { useStarshipChains } from './useStarshipChains';
import { chainStore, useChainStore } from '@/contexts';
import { StarshipChains } from './useStarshipChains';

export const useAddHyperwebChain = () => {
  const { isHyperwebAdded } = useChainStore();
  const { data, refetch } = useStarshipChains();
  const { v2: starshipData } = data ?? {};
  const { addChains } = useWalletManager();

  useEffect(() => {
    if (starshipData && !isHyperwebAdded) {
      addHyperwebChain(starshipData);
    }
  }, [starshipData, isHyperwebAdded]);

  const refetchAndAddChain = () => {
    refetch().then(({ data }) => {
      addHyperwebChain(data?.v2);
    });
  };

  const addHyperwebChain = (data: StarshipChains['v2'] | null | undefined) => {
    if (!data) return;
    addChains(data.chains, data.assets);
    chainStore.setSelectedChain(data.chains[0].chainName);
    chainStore.setIsHyperwebAdded(true);
  };

  return {
    addHyperwebChain,
    refetchAndAddChain,
    isHyperwebAdded,
  };
};
