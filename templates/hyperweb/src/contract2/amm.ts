// @ts-ignore, `~bank` is an internal package
import { getBalance, sendCoins } from '~bank';

import { store } from './sdk';
import {Msg, StateEntries, State} from './types'

const contractStore = store({
  totalSupply: 0,
  balance: (address: string) => 0,
  reserves: [0, 0],
});

export class Contract {
  msg: Msg;
  address: string;
  totalSupply: any;
  balance: any;
  reserves: any;

  constructor(state: State, {msg, address}: {msg: Msg, address: string}) {
    this.msg = msg;
    this.address = address;

    const store = contractStore(state);
    this.totalSupply = store.totalSupply;
    this.balance = store.balance;
    this.reserves = store.reserves;
  }

  token0: string = "USDC";
  token1: string = "ATOM";

  schema = {
    getTotalSupply: {
      type: "number",
    }
  }

  getTotalSupply() {
    return this.totalSupply.value;
  }

  getBalance(address: string) {
    return this.balance(address).value;
  }

  getReserves() {
    return this.reserves.value;
  }

  #getBankBalance(address: string, token: string) {
    return getBalance(address, token);
  }

  #mint(to: string, amount: number) {
    const balance = this.balance(to).value;
    this.balance(to).value = balance + amount;
    this.totalSupply.value += amount;
  }

  #burn(from: string, amount: number) {
    const balance = this.balance(from).value;
    if (balance < amount) {
      throw Error("insufficient balance");
    }
    this.balance(from).value = balance - amount;
    this.totalSupply.value -= amount;
  }

  #update(amount0: number, amount1: number) {
    const [reserve0, reserve1] = this.reserves.value;
    this.reserves.value = [
      reserve0 + amount0,
      reserve1 + amount1,
    ];
  }

  swap({tokenIn, amountIn}: {tokenIn: string, amountIn: number}) {
    const isToken0 = tokenIn == this.token0;
    const isToken1 = tokenIn == this.token1;

    if (!isToken0 && !isToken1) {
      throw Error("invalid token");
    }

    const [reserve0, reserve1] = this.reserves.value;
    let tokenOut, reserveIn, reserveOut;

    [tokenIn, tokenOut, reserveIn, reserveOut] =
      isToken0
        ? [this.token0, this.token1, reserve0, reserve1]
        : [this.token1, this.token0, reserve1, reserve0];

    sendCoins(this.msg.sender, this.address, {
      [tokenIn]: amountIn,
    });

    const amountInWithFee = amountIn * 997 / 1000;
    const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);

    sendCoins(this.address, this.msg.sender, {
      [tokenOut]: amountOut,
    });

    this.#update(
      this.#getBankBalance(this.address, this.token0).amount,
      this.#getBankBalance(this.address, this.token1).amount,
    );

    return amountOut;
  }

  addLiquidity({amount0, amount1}: {amount0: number, amount1: number}) {
    sendCoins(this.msg.sender, this.address, {
      [this.token0]: amount0,
      [this.token1]: amount1,
    });

    const [reserve0, reserve1] = this.reserves.value;

    if (reserve0 > 0 || reserve1 > 0) {
      if (reserve0 * amount1 != reserve1 * amount0) {
        throw Error("invalid liquidity");
      }
    }

    let shares = 0
    if (this.totalSupply.value > 0) {
      shares = Math.sqrt(amount0 * amount1)
    } else {
      shares = Math.min(
        (amount0 * this.totalSupply.value) / reserve0,
        (amount1 * this.totalSupply.value) / reserve1,
      )
    }

    this.#mint(this.msg.sender, shares);

    this.#update(
      this.#getBankBalance(this.address, this.token0).amount,
      this.#getBankBalance(this.address, this.token1).amount,
    );

    return shares;
  }

  removeLiquidity({shares}: {shares: number}) {
    const bal0 = this.#getBankBalance(this.address, this.token0);
    const bal1 = this.#getBankBalance(this.address, this.token1);
    const totalSupply = this.totalSupply.value;

    const amount0 = bal0 * shares / totalSupply;
    const amount1 = bal1 * shares / totalSupply;
    this.#burn(this.msg.sender, shares);
    this.#update(bal0 - amount0, bal1 - amount1);
    sendCoins(this.address, this.msg.sender, {
      [this.token0]: amount0,
      [this.token1]: amount1,
    });

    return [amount0, amount1];
  }
}
