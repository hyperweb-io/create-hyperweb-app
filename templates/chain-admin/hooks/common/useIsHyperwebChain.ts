import { useChainStore } from '@/contexts';
import { useStarshipChains } from './useStarshipChains';

export const useIsHyperwebChain = () => {
  const { selectedChain } = useChainStore();
  const { data: starshipData } = useStarshipChains();

  return starshipData?.v2.chains[0].chainName === selectedChain;
};
