import { create } from 'zustand';
import { HYPERWEB_CHAIN_NAME } from '@/config';

interface ChainStore {
  selectedChain: string;
  isHyperwebAdded: boolean;
}

export const useChainStore = create<ChainStore>()(() => ({
  selectedChain: HYPERWEB_CHAIN_NAME,
  isHyperwebAdded: false,
}));

export const chainStore = {
  setSelectedChain: (chainName: string) => {
    useChainStore.setState({ selectedChain: chainName });
  },
  setIsHyperwebAdded: (isAdded: boolean) => {
    useChainStore.setState({ isHyperwebAdded: isAdded });
  },
};
