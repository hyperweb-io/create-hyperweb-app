import { useEffect, useState } from 'react';
import { useManager } from '@cosmos-kit/react';

import { getSignerOptions } from '@/utils';
import { useStarshipChains } from './useStarshipChains';
import { chainStore, useChainStore } from '@/contexts';
import { StarshipChains } from './useStarshipChains';

export const useAddHyperwebChain = () => {
  const { isHyperwebAdded } = useChainStore();
  const { data: starshipData, refetch } = useStarshipChains();
  const { addChains } = useManager();

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
    addChains(data.chains, data.assets, getSignerOptions());
    chainStore.setSelectedChain(data.chains[0].chain_name);
    chainStore.setIsHyperwebAdded(true);
  };

  return {
    addHyperwebChain,
    refetchAndAddChain,
    isHyperwebAdded,
  };
};
