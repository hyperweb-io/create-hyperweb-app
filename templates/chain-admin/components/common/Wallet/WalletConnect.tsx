import { useState } from 'react';
import { useChain } from '@interchain-kit/react';

import { useChainStore } from '@/contexts';
import { Connected } from './Connected';
import { Connecting } from './Connecting';
import { SelectWallet } from './SelectWallet';

export const WalletConnect = () => {
  const { selectedChain } = useChainStore();
  const { wallet, address } = useChain(selectedChain);

  const [selectedWalletName, setSelectedWalletName] = useState<string | null>(
    wallet && address ? wallet.info.name : null
  );

  if (selectedWalletName && address) {
    return (
      <Connected
        selectedWalletName={selectedWalletName}
        clearSelectedWallet={() => setSelectedWalletName(null)}
      />
    );
  }

  if (selectedWalletName) {
    return (
      <Connecting
        selectedWalletName={selectedWalletName}
        clearSelectedWallet={() => setSelectedWalletName(null)}
      />
    );
  }

  return <SelectWallet setSelectedWalletName={setSelectedWalletName} />;
};
