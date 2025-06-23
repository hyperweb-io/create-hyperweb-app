import { useMemo } from 'react';
import { useWalletManager } from '@interchain-kit/react';
import { Asset, AssetList } from '@chain-registry/types';
import { asset_lists as ibcAssetLists } from '@chain-registry/assets';
import { assetLists as chainAssets, ibcData as ibc } from 'chain-registry';
import { Coin } from '@interchainjs/react/types';
import BigNumber from 'bignumber.js';

import { PrettyAsset } from '@/components';
import { CoinDenom, CoinSymbol, Exponent, PriceHash } from '@/utils';

import { useStarshipChains } from '../common';

export const useChainUtils = (chainName: string) => {
  const { chains, assetLists } = useWalletManager();
  const { data: starshipData } = useStarshipChains();
  const { chains: starshipChains = [], assets: starshipAssets = [] } =
    starshipData?.v1 ?? {};

  const isStarshipChain = starshipChains.some(
    (chain) => chain.chainName === chainName
  );

  const filterAssets = (assetList: AssetList[]): Asset[] => {
    return (
      assetList
        .find(({ chainName }) => chainName === chainName)
        ?.assets?.filter(({ typeAsset }) => typeAsset !== 'ics20') || []
    );
  };

  const { nativeAssets, ibcAssets } = useMemo(() => {
    // @ts-ignore
    const nativeAssets = filterAssets([
      ...chainAssets,
      ...(isStarshipChain ? starshipAssets : []),
    ]);
    // @ts-ignore
    const ibcAssets = filterAssets(ibcAssetLists);

    return { nativeAssets, ibcAssets };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName]);

  const allAssets = [...nativeAssets, ...ibcAssets];

  const getIbcAssetsLength = () => {
    return ibcAssets.length;
  };

  const getAssetByDenom = (denom: CoinDenom): Asset => {
    return allAssets.find((asset) => asset.base === denom) as Asset;
  };

  const denomToSymbol = (denom: CoinDenom): CoinSymbol => {
    const asset = getAssetByDenom(denom);
    const symbol = asset?.symbol;
    if (!symbol) {
      return denom;
    }
    return symbol;
  };

  const symbolToDenom = (symbol: CoinSymbol, chainName?: string): CoinDenom => {
    const asset = allAssets.find(
      (asset) =>
        asset.symbol === symbol &&
        (!chainName ||
          asset.traces?.[0].counterparty.chainName.toLowerCase() ===
            chainName.toLowerCase())
    );
    const base = asset?.base;
    if (!base) {
      return symbol;
    }
    return base;
  };

  const getExponentByDenom = (denom: CoinDenom): Exponent => {
    const asset = getAssetByDenom(denom);
    const unit = asset.denomUnits.find(({ denom }) => denom === asset.display);
    return unit?.exponent || 0;
  };

  const convRawToDispAmount = (symbol: string, amount: string | number) => {
    const denom = symbolToDenom(symbol);
    return new BigNumber(amount)
      .shiftedBy(-getExponentByDenom(denom))
      .toString();
  };

  const calcCoinDollarValue = (prices: PriceHash, coin: Coin) => {
    const { denom, amount } = coin;
    return new BigNumber(amount)
      .shiftedBy(-getExponentByDenom(denom))
      .multipliedBy(prices[denom])
      .toString();
  };

  const getChainName = (ibcDenom: CoinDenom) => {
    if (nativeAssets.find((asset) => asset.base === ibcDenom)) {
      return chainName;
    }
    const asset = ibcAssets.find((asset) => asset.base === ibcDenom);
    const ibcChainName = asset?.traces?.[0].counterparty.chainName;
    if (!ibcChainName)
      throw Error('chainName not found for ibcDenom: ' + ibcDenom);
    return ibcChainName;
  };

  const getPrettyChainName = (ibcDenom: CoinDenom) => {
    const chainName = getChainName(ibcDenom);
    const chain = chains.find((chain) => chain.chainName === chainName);
    if (!chain) throw Error('chain not found');
    return chain.prettyName;
  };

  const isNativeAsset = ({ denom }: PrettyAsset) => {
    return !!nativeAssets.find((asset) => asset.base === denom);
  };

  const getNativeDenom = (chainName: string) => {
    const assetList = assetLists.find((chain) => chain.chainName === chainName);
    const denom = assetList?.assets?.[0]?.base;
    if (!denom) throw Error('denom not found');
    return denom;
  };

  const getDenomBySymbolAndChain = (chainName: string, symbol: string) => {
    const assetList = assetLists.find((chain) => chain.chainName === chainName);
    const denom = assetList?.assets.find(
      (asset) => asset.symbol === symbol
    )?.base;
    if (!denom) throw Error('denom not found');
    return denom;
  };

  const getIbcInfo = (fromChainName: string, toChainName: string) => {
    let flipped = false;

    let ibcInfo = ibc.find(
      (i) =>
        i.chain1.chainName === fromChainName &&
        i.chain2.chainName === toChainName
    );

    if (!ibcInfo) {
      ibcInfo = ibc.find(
        (i) =>
          i.chain1.chainName === toChainName &&
          i.chain2.chainName === fromChainName
      );
      flipped = true;
    }

    if (!ibcInfo) {
      throw new Error('cannot find IBC info');
    }

    const key = flipped ? 'chain2' : 'chain1';
    const sourcePort = ibcInfo.channels[0][key].portId;
    const sourceChannel = ibcInfo.channels[0][key].channelId;

    return { sourcePort, sourceChannel };
  };

  return {
    isStarshipChain,
    allAssets,
    nativeAssets,
    ibcAssets,
    getAssetByDenom,
    denomToSymbol,
    symbolToDenom,
    convRawToDispAmount,
    calcCoinDollarValue,
    getIbcAssetsLength,
    getChainName,
    getPrettyChainName,
    isNativeAsset,
    getNativeDenom,
    getIbcInfo,
    getExponentByDenom,
    getDenomBySymbolAndChain,
  };
};
