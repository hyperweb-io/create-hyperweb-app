import { SigningClient } from '@interchainjs/cosmos/signing-client';
import {
  DirectGenericOfflineSigner,
  AminoGenericOfflineSigner,
} from '@interchainjs/cosmos/types/wallet';
import { useQuery } from '@tanstack/react-query';
import { useChain } from '@interchain-kit/react';

import { useChainStore } from '@/contexts';

import { useRpcEndpoint } from './useRpcEndpoint';

export const useCustomSigningClient = ({
  signerType = 'direct',
}: {
  signerType?: 'direct' | 'amino';
} = {}) => {
  const { selectedChain } = useChainStore();
  const { chain } = useChain(selectedChain);
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);

  const chainId = chain.chainId || '';
  const signerAmino = new AminoGenericOfflineSigner(
    (window as any).keplr.getOfflineSignerOnlyAmino(chainId)
  );
  const signerDirect = new DirectGenericOfflineSigner(
    (window as any).keplr.getOfflineSigner(chainId)
  );

  return useQuery({
    queryKey: ['useCustomSigningClient', signerType, chainId],
    queryFn: async () => {
      const client = await SigningClient.connectWithSigner(
        rpcEndpoint!,
        signerType === 'amino' ? signerAmino : signerDirect,
        {
          broadcast: {
            checkTx: true,
            deliverTx: true,
          },
        }
      );
      return client;
    },
    enabled: !!rpcEndpoint && !!chainId,
  });
};
