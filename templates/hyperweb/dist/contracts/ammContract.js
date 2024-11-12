// src/amm-contract/sdk.ts
function useStore(key, defaultValue) {
  return (state) => [
    () => state.get(key) ?? defaultValue,
    (value) => state.set(key, value)
  ];
}
function useMapping(keys, defaultValue) {
  return (state) => [
    (...args) => {
      const interleavedKey = [keys[0]];
      const pathKeys = keys.slice(1);
      for (let i = 0; i < pathKeys.length; i++) {
        interleavedKey.push(pathKeys[i], args[i]);
      }
      return state.get(interleavedKey.join("/")) ?? defaultValue;
    },
    (...args) => {
      const interleavedKey = [keys[0]];
      const pathKeys = keys.slice(1);
      const keyArgs = args.slice(0, -1);
      for (let i = 0; i < pathKeys.length; i++) {
        interleavedKey.push(pathKeys[i], keyArgs[i]);
      }
      state.set(interleavedKey.join("/"), args[args.length - 1]);
    }
  ];
}

// src/amm-contract/amm.ts
import { getBalance, sendCoins } from "~bank";
var totalSupply = useStore("totalSupply", 0);
var balance = useMapping(["balance", "address"], 0);
var reserves = useStore("reserves", [0, 0]);
var Contract = class {
  msg;
  address;
  totalSupply;
  setTotalSupply;
  balance;
  setBalance;
  reserves;
  setReserves;
  constructor(state, { msg, address }) {
    this.msg = msg;
    this.address = address;
    [this.totalSupply, this.setTotalSupply] = totalSupply(state);
    [this.balance, this.setBalance] = balance(state);
    [this.reserves, this.setReserves] = reserves(state);
  }
  token0 = "uusdc";
  // ibc denom for usdc
  token1 = "uatom";
  // ibc denom for atom
  getTotalSupply() {
    return this.totalSupply();
  }
  getBalance(address) {
    return this.balance(address);
  }
  getReserves() {
    return this.reserves();
  }
  #getBankBalance(address, token) {
    return getBalance(address, token);
  }
  #mint(to, amount) {
    const balance2 = this.balance(to);
    this.setBalance(to, balance2 + amount);
    this.setTotalSupply(this.totalSupply() + amount);
  }
  #burn(from, amount) {
    const balance2 = this.balance(from);
    if (balance2 < amount) {
      throw Error("insufficient balance");
    }
    this.setBalance(from, balance2 - amount);
    this.setTotalSupply(this.totalSupply() - amount);
  }
  #update(amount0, amount1) {
    const [reserve0, reserve1] = this.reserves();
    this.setReserves([
      reserve0 + amount0,
      reserve1 + amount1
    ]);
  }
  // swap method adjusted for uusdc and uatom scaling
  swap({ tokenIn, amountIn }) {
    const isToken0 = tokenIn == this.token0;
    const isToken1 = tokenIn == this.token1;
    if (!isToken0 && !isToken1) {
      throw Error("invalid token");
    }
    const [reserve0, reserve1] = this.reserves();
    let tokenOut, reserveIn, reserveOut;
    [tokenIn, tokenOut, reserveIn, reserveOut] = isToken0 ? [this.token0, this.token1, reserve0, reserve1] : [this.token1, this.token0, reserve1, reserve0];
    const adjustedAmountIn = amountIn / 1e6;
    sendCoins(this.msg.sender, this.address, {
      [tokenIn]: amountIn
      // Amount in uusdc/uatom remains unchanged
    });
    const amountInWithFee = adjustedAmountIn * 997 / 1e3;
    const amountOut = reserveOut * amountInWithFee / (reserveIn + amountInWithFee);
    sendCoins(this.address, this.msg.sender, {
      [tokenOut]: amountOut * 1e6
      // Convert output back to uusdc/uatom
    });
    this.#update(
      this.#getBankBalance(this.address, this.token0).amount,
      this.#getBankBalance(this.address, this.token1).amount
    );
    return amountOut * 1e6;
  }
  // addLiquidity method adjusted for uusdc and uatom scaling
  addLiquidity({ amount0, amount1 }) {
    sendCoins(this.msg.sender, this.address, {
      [this.token0]: amount0,
      // uusdc
      [this.token1]: amount1
      // uatom
    });
    const [reserve0, reserve1] = this.reserves();
    if (reserve0 > 0 || reserve1 > 0) {
      if (reserve0 * (amount1 / 1e6) != reserve1 * (amount0 / 1e6)) {
        throw Error("invalid liquidity");
      }
    }
    let shares = 0;
    const adjustedAmount0 = amount0 / 1e6;
    const adjustedAmount1 = amount1 / 1e6;
    if (this.totalSupply() > 0) {
      shares = Math.sqrt(adjustedAmount0 * adjustedAmount1);
    } else {
      shares = Math.min(
        adjustedAmount0 * this.totalSupply() / reserve0,
        adjustedAmount1 * this.totalSupply() / reserve1
      );
    }
    this.#mint(this.msg.sender, shares);
    this.#update(
      this.#getBankBalance(this.address, this.token0).amount,
      this.#getBankBalance(this.address, this.token1).amount
    );
    return shares;
  }
  // removeLiquidity method adjusted for uusdc and uatom scaling
  removeLiquidity({ shares }) {
    const bal0 = this.#getBankBalance(this.address, this.token0).amount;
    const bal1 = this.#getBankBalance(this.address, this.token1).amount;
    const totalSupply2 = this.totalSupply();
    const amount0 = bal0 * shares / totalSupply2 * 1e6;
    const amount1 = bal1 * shares / totalSupply2 * 1e6;
    this.#burn(this.msg.sender, shares);
    this.#update(bal0 - amount0 / 1e6, bal1 - amount1 / 1e6);
    sendCoins(this.address, this.msg.sender, {
      [this.token0]: amount0,
      // uusdc
      [this.token1]: amount1
      // uatom
    });
    return [amount0, amount1];
  }
};

// src/amm-contract/index.ts
var amm_contract_default = Contract;
export {
  Contract,
  amm_contract_default as default,
  useMapping,
  useStore
};
//# sourceMappingURL=ammContract.js.map
