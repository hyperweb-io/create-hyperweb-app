import { useChain } from '@interchain-kit/react';
import { useQuery } from '@tanstack/react-query';
import {
  getContractsByCreator,
  getContractInfo,
} from '@interchainjs/react/cosmwasm/wasm/v1/query.rpc.func';

import { useChainStore } from '@/contexts';

import { useIsHyperwebChain, useRpcEndpoint } from '../common';
import { JsdQueryClient, useJsdQueryClient } from './useJsdQueryClient';
import { HttpEndpoint } from '@interchainjs/types';

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
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);
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
        } else if (!isHyperwebChain && rpcEndpoint) {
          contracts.wasmContracts = await fetchWasmContracts(
            rpcEndpoint,
            address
          );
        }
      }

      return contracts;
    },
    enabled: !!address && (isHyperwebChain ? !!jsdClient : !!rpcEndpoint),
  });
};

const fetchWasmContracts = async (
  client: string | HttpEndpoint,
  address: string
) => {
  try {
    const { contractAddresses } = await getContractsByCreator(client, {
      creatorAddress: address,
      pagination: {
        limit: 1000n,
        reverse: true,
        countTotal: false,
        key: new Uint8Array(),
        offset: 0n,
      },
    });

    const contracts = await Promise.all(
      contractAddresses.map((contractAddress: string) =>
        getContractInfo(client, { address: contractAddress })
      )
    );

    return contracts;
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
