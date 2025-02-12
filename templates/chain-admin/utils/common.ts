import { Wallet } from '@interchain-kit/core';
import { Asset, AssetList, Chain } from '@chain-registry/v2-types';
import BigNumber from 'bignumber.js';

export const getNativeAsset = (assets: AssetList) => {
  return assets.assets[0] as Asset;
};

export const getExponentFromAsset = (asset: Asset) => {
  const unit = asset.denomUnits.find((unit) => unit.denom === asset.display);
  return unit?.exponent ?? 6;
};

export const shortenAddress = (address: string, partLength = 6) => {
  return `${address.slice(0, partLength)}...${address.slice(-partLength)}`;
};

export const getWalletLogo = (wallet?: Wallet) => {
  if (!wallet?.logo) return '';

  return typeof wallet.logo === 'string'
    ? wallet.logo
    : wallet.logo.major || wallet.logo.minor;
};

function toCamelCase(key: string) {
  return (
    key
      // First, remove all leading non-alphabet characters except $
      .replace(/^[^a-zA-Z$]+/, '')
      // Convert what follows a separator into upper case
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      // Ensure the first character of the result is always lowercase
      .replace(/^./, (c) => c.toLowerCase())
  );
}

export function convertKeysToCamelCase(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToCamelCase(item));
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = toCamelCase(key);
    const value = convertKeysToCamelCase(obj[key]);
    result[camelKey as keyof typeof result] = value;
    return result;
  }, {} as Record<string, any>);
}

export const convertGasToTokenAmount = (
  gasAmount: string,
  chain: Chain,
  exponent: number
) => {
  const gasPrice = chain.fees?.feeTokens[0].averageGasPrice ?? 0.025;
  return BigNumber(gasAmount).shiftedBy(-exponent).multipliedBy(gasPrice);
};
