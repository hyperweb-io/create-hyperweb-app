import { useChain } from '@cosmos-kit/react';
import { useQuery } from '@tanstack/react-query';

import { useChainStore } from '@/contexts';
import { useIsHyperwebChain } from '../common';
import { CwQueryClient, useCwQueryClient } from './useCwQueryClient';
import { JsdQueryClient, useJsdQueryClient } from './useJsdQueryClient';

export type WasmContractInfo = Awaited<
  ReturnType<typeof fetchWasmContracts>
>[number];

export type JsdContractInfo = Awaited<
  ReturnType<typeof fetchJsdContracts>
>[number];

type Contracts = {
  wasmContracts: WasmContractInfo[];
  jsdContracts: JsdContractInfo[];
};

export const useMyContracts = () => {
  const { selectedChain } = useChainStore();
  const { address } = useChain(selectedChain);
  const { data: cwClient } = useCwQueryClient();
  const { data: jsdClient } = useJsdQueryClient();
  const isHyperwebChain = useIsHyperwebChain();

  return useQuery<Contracts>({
    queryKey: ['myContracts', selectedChain, address],
    queryFn: async () => {
      const contracts: Contracts = {
        wasmContracts: [],
        jsdContracts: [],
      };

      if (address) {
        if (isHyperwebChain && jsdClient) {
          contracts.jsdContracts = await fetchJsdContracts(jsdClient, address);
        } else if (!isHyperwebChain && cwClient) {
          contracts.wasmContracts = await fetchWasmContracts(cwClient, address);
        }
      }

      return contracts;
    },
    enabled: !!address && (isHyperwebChain ? !!jsdClient : !!cwClient),
  });
};

const fetchWasmContracts = async (client: CwQueryClient, address: string) => {
  try {
    const { contractAddresses } =
      await client.cosmwasm.wasm.v1.contractsByCreator({
        creatorAddress: address,
        pagination: {
          limit: 1000n,
          reverse: true,
          countTotal: false,
          key: new Uint8Array(),
          offset: 0n,
        },
      });

    return await Promise.all(
      contractAddresses.map((address) =>
        client.cosmwasm.wasm.v1.contractInfo({ address })
      )
    );
  } catch (error) {
    console.error('Error fetching WASM contracts:', error);
    return [];
  }
};

const fetchJsdContracts = async (client: JsdQueryClient, address: string) => {
  try {
    const response = await client.jsd.jsd.contractsAll({
      pagination: {
        limit: 1000n,
        reverse: true,
        countTotal: false,
        key: new Uint8Array(),
        offset: 0n,
      },
    });
    return response.contracts.filter(
      (contract) => contract.creator === address
    );
  } catch (error) {
    console.error('Error fetching JSD contracts:', error);
    return [];
  }
};
