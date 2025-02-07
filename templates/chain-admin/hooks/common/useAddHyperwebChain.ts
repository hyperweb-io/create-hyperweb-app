import { useEffect } from 'react';
import { useWalletManager } from '@interchain-kit/react';

import { useStarshipChains } from './useStarshipChains';
import { chainStore, useChainStore } from '@/contexts';
import { StarshipChains } from './useStarshipChains';

export const useAddHyperwebChain = () => {
  const { isHyperwebAdded } = useChainStore();
  const { data: starshipData, refetch } = useStarshipChains();
  const { addChains } = useWalletManager();

  useEffect(() => {
    if (starshipData && !isHyperwebAdded) {
      addHyperwebChain(starshipData);
    }
  }, [starshipData, isHyperwebAdded]);

  const refetchAndAddChain = () => {
    refetch().then(({ data }) => {
      addHyperwebChain(data);
    });
  };

  const addHyperwebChain = (data: StarshipChains | null | undefined) => {
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
