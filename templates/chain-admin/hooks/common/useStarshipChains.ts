import { useQuery } from '@tanstack/react-query';
import { AssetList, Chain } from '@chain-registry/types';
import {
  Chain as ChainV2,
  AssetList as AssetListV2,
} from '@chain-registry/v2-types';

import { StarshipConfig } from '@/starship';
import { convertKeysToCamelCase } from '@/utils';
import config from '@/starship/configs/config.yaml';

export type StarshipChains = {
  v1: {
    chains: Chain[];
    assets: AssetList[];
  };
  v2: {
    chains: ChainV2[];
    assets: AssetListV2[];
  };
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
          ? {
              v1: {
                chains,
                assets,
              },
              v2: {
                chains: convertKeysToCamelCase(chains) as ChainV2[],
                assets: convertKeysToCamelCase(assets) as AssetListV2[],
              },
            }
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
