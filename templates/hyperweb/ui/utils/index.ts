import { Asset, Chain } from '@chain-registry/types';
import { chains } from 'chain-registry';

export function getLogo(from: Asset | Chain) {
  return from.logoURIs?.svg || from.logoURIs?.png;
}

export function getChainLogo(name: string) {
  const chain = chains.find(chain => chain.chainName === name)
  return chain ? getLogo(chain) : null;
}