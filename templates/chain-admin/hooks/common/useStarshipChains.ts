import { useQuery } from '@tanstack/react-query';
import { AssetList, Chain } from '@chain-registry/types';

import { StarshipConfig } from '@/starship';
import config from '@/starship/configs/config.yaml';

export type StarshipChains = {
  chains: Chain[];
  assets: AssetList[];
};

export const useStarshipChains = () => {
  const { registry } = config as StarshipConfig;
  const baseUrl = `http://localhost:${registry.ports.rest}`;

  return useQuery({
    queryKey: ['starship-chains'],
    queryFn: async (): Promise<StarshipChains | null> => {
      try {
        const { chains = [] } =
          (await fetcher<{ chains: Chain[] }>(`${baseUrl}/chains`)) ?? {};

        const assets = (await Promise.all(
          chains.map((chain) =>
            fetcher<AssetList>(`${baseUrl}/chains/${chain.chain_id}/assets`)
          )
        ).then((assetLists) => assetLists.filter(Boolean))) as AssetList[];

        return chains.length > 0 && assets.length > 0
          ? { chains, assets }
          : null;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

const fetcher = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
