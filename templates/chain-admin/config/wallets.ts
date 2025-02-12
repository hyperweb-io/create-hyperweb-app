import { keplrExtensionInfo } from '@interchain-kit/keplr-extension';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';

export const keplrWalletName = keplrExtensionInfo.name;
export const wallets = [keplrWallet, leapWallet];
