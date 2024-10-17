// @ts-ignore, `~bank` is an internal package
import { getBalance, sendCoins } from '~bank';

import { useMapping, useStore } from './sdk';
import { MappingStore, Msg, State, Store } from './types'

const totalSupply: Store<number> = useStore('totalSupply', 0);
const balance: MappingStore<[string], number> = useMapping(['balance', 'address'], 0);
const reserves: Store<[number, number]> = useStore('reserves', [0, 0]);

export class Contract {
  msg: Msg;
  address: string;
  totalSupply;
  setTotalSupply;
  balance; 
  setBalance;
  reserves;
  setReserves;

  constructor(state: State, {msg, address}: {msg: Msg, address: string}) {
    this.msg = msg;
    this.address = address;

    [this.totalSupply, this.setTotalSupply] = totalSupply(state);
    [this.balance, this.setBalance] = balance(state);
    [this.reserves, this.setReserves] = reserves(state);
  }

  token0: string = "uusdc"; // ibc denom for usdc
  token1: string = "uatom"; // ibc denom for atom

  getTotalSupply(): number {
    return this.totalSupply();
  }

  getBalance(address: string): number {
    return this.balance(address);
  }

  getReserves(): [number, number] {
    return this.reserves();
  }

  #getBankBalance(address: string, token: string): { amount: number, denom: string } {
    return getBalance(address, token);
  }

  #mint(to: string, amount: number) {
    const balance = this.balance(to);
    this.setBalance(to, balance + amount);
    this.setTotalSupply(this.totalSupply() + amount);
  }

  #burn(from: string, amount: number) {
    const balance = this.balance(from);
    if (balance < amount) {
      throw Error("insufficient balance");
    }
    this.setBalance(from, balance - amount);
    this.setTotalSupply(this.totalSupply() - amount);
  }

  #update(amount0: number, amount1: number) {
    const [reserve0, reserve1] = this.reserves();
    this.setReserves([
      reserve0 + amount0,
      reserve1 + amount1,
    ]);
  }

  // swap method adjusted for uusdc and uatom scaling
  swap({tokenIn, amountIn}: {tokenIn: string, amountIn: number}) {
    const isToken0 = tokenIn == this.token0;
    const isToken1 = tokenIn == this.token1;

    if (!isToken0 && !isToken1) {
      throw Error("invalid token");
    }

    const [reserve0, reserve1] = this.reserves();
    let tokenOut, reserveIn, reserveOut;

    [tokenIn, tokenOut, reserveIn, reserveOut] =
      isToken0
        ? [this.token0, this.token1, reserve0, reserve1]
        : [this.token1, this.token0, reserve1, reserve0];

    // Adjust amountIn to account for scaling (from uusdc/uatom)
    const adjustedAmountIn = amountIn / 1e6;  // Convert back to full tokens
    sendCoins(this.msg.sender, this.address, {
      [tokenIn]: amountIn, // Amount in uusdc/uatom remains unchanged
    });

    const amountInWithFee = adjustedAmountIn * 997 / 1000;
    const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

    sendCoins(this.address, this.msg.sender, {
      [tokenOut]: amountOut * 1e6,  // Convert output back to uusdc/uatom
    });

    this.#update(
      this.#getBankBalance(this.address, this.token0).amount,
      this.#getBankBalance(this.address, this.token1).amount,
    );

    return amountOut * 1e6;  // Return result in uusdc/uatom
  }

  // addLiquidity method adjusted for uusdc and uatom scaling
  addLiquidity({amount0, amount1}: {amount0: number, amount1: number}) {
    sendCoins(this.msg.sender, this.address, {
      [this.token0]: amount0, // uusdc
      [this.token1]: amount1, // uatom
    });

    const [reserve0, reserve1] = this.reserves();

    if (reserve0 > 0 || reserve1 > 0) {
      if (reserve0 * (amount1 / 1e6) != reserve1 * (amount0 / 1e6)) {
        throw Error("invalid liquidity");
      }
    }

    let shares = 0;
    const adjustedAmount0 = amount0 / 1e6;  // Convert to full tokens
    const adjustedAmount1 = amount1 / 1e6;  // Convert to full tokens

    if (this.totalSupply() > 0) {
      shares = Math.sqrt(adjustedAmount0 * adjustedAmount1);
    } else {
      shares = Math.min(
        (adjustedAmount0 * this.totalSupply()) / reserve0,
        (adjustedAmount1 * this.totalSupply()) / reserve1,
      );
    }

    this.#mint(this.msg.sender, shares);

    this.#update(
      this.#getBankBalance(this.address, this.token0).amount,
      this.#getBankBalance(this.address, this.token1).amount,
    );

    return shares;
  }

  // removeLiquidity method adjusted for uusdc and uatom scaling
  removeLiquidity({shares}: {shares: number}) {
    const bal0 = this.#getBankBalance(this.address, this.token0).amount;
    const bal1 = this.#getBankBalance(this.address, this.token1).amount;
    const totalSupply = this.totalSupply();

    // Adjust output to uusdc/uatom
    const amount0 = (bal0 * shares / totalSupply) * 1e6;
    const amount1 = (bal1 * shares / totalSupply) * 1e6;

    this.#burn(this.msg.sender, shares);
    this.#update(bal0 - amount0 / 1e6, bal1 - amount1 / 1e6);

    sendCoins(this.address, this.msg.sender, {
      [this.token0]: amount0,  // uusdc
      [this.token1]: amount1,  // uatom
    });

    return [amount0, amount1];  // Return uusdc/uatom
  }
}
