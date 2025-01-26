import { chains } from '@chain-registry/v2';
import { Asset, Chain } from '@chain-registry/v2-types';

export function getLogo(from: Asset | Chain) {
  return from.logoURIs?.svg || from.logoURIs?.png;
}

export function getChainLogo(name: string) {
  const chain = chains.find(chain => chain.chainName === name)
  return chain ? getLogo(chain) : null;
}