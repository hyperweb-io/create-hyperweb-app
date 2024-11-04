import { useChainStore } from '@/contexts';
import { useStarshipChains } from './useStarshipChains';

export const useIsHyperwebChain = () => {
  const { selectedChain } = useChainStore();
  const { data: starshipData } = useStarshipChains();

  return starshipData?.chains[0].chain_name === selectedChain;
};
