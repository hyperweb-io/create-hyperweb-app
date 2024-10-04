// src/contract2/utils.ts
function storeEntry(state, keys, value) {
  const key = keys.join("/");
  return {
    get value() {
      return state.get(key) ?? value;
    },
    set value(newValue) {
      state.set(key, newValue);
    }
  };
}

// src/contract2/sdk.ts
function store(stateEntries) {
  return (state) => {
    let storeMap = {};
    function defineStore(keys, value) {
      if (typeof value === "function") {
        return (subkey) => {
          return defineStore([...keys, subkey], value(subkey));
        };
      }
      return storeEntry(state, keys, value);
    }
    Object.entries(stateEntries).forEach(([key, value]) => {
      storeMap[key] = defineStore([key], value);
    });
    return storeMap;
  };
}

// src/contract2/amm.ts
import { getBalance, sendCoins } from "~bank";
var contractStore = store({
  totalSupply: 0,
  balance: (address) => 0,
  reserves: [0, 0]
});
var Contract = class {
  msg;
  address;
  totalSupply;
  balance;
  reserves;
  constructor(state, { msg, address }) {
    this.msg = msg;
    this.address = address;
    const store2 = contractStore(state);
    this.totalSupply = store2.totalSupply;
    this.balance = store2.balance;
    this.reserves = store2.reserves;
  }
  token0 = "USDC";
  token1 = "ATOM";
  schema = {
    getTotalSupply: {
      type: "number"
    }
  };
  getTotalSupply() {
    return this.totalSupply.value;
  }
  getBalance(address) {
    return this.balance(address).value;
  }
  getReserves() {
    return this.reserves.value;
  }
  #getBankBalance(address, token) {
    return getBalance(address, token);
  }
  #mint(to, amount) {
    const balance = this.balance(to).value;
    this.balance(to).value = balance + amount;
    this.totalSupply.value += amount;
  }
  #burn(from, amount) {
    const balance = this.balance(from).value;
    if (balance < amount) {
      throw Error("insufficient balance");
    }
    this.balance(from).value = balance - amount;
    this.totalSupply.value -= amount;
  }
  #update(amount0, amount1) {
    const [reserve0, reserve1] = this.reserves.value;
    this.reserves.value = [
      reserve0 + amount0,
      reserve1 + amount1
    ];
  }
  swap({ tokenIn, amountIn }) {
    const isToken0 = tokenIn == this.token0;
    const isToken1 = tokenIn == this.token1;
    if (!isToken0 && !isToken1) {
      throw Error("invalid token");
    }
    const [reserve0, reserve1] = this.reserves.value;
    let tokenOut, reserveIn, reserveOut;
    [tokenIn, tokenOut, reserveIn, reserveOut] = isToken0 ? [this.token0, this.token1, reserve0, reserve1] : [this.token1, this.token0, reserve1, reserve0];
    sendCoins(this.msg.sender, this.address, {
      [tokenIn]: amountIn
    });
    const amountInWithFee = amountIn * 997 / 1e3;
    const amountOut = reserveOut * amountInWithFee / (reserveIn + amountInWithFee);
    sendCoins(this.address, this.msg.sender, {
      [tokenOut]: amountOut
    });
    this.#update(
      this.#getBankBalance(this.address, this.token0).amount,
      this.#getBankBalance(this.address, this.token1).amount
    );
    return amountOut;
  }
  addLiquidity({ amount0, amount1 }) {
    sendCoins(this.msg.sender, this.address, {
      [this.token0]: amount0,
      [this.token1]: amount1
    });
    const [reserve0, reserve1] = this.reserves.value;
    if (reserve0 > 0 || reserve1 > 0) {
      if (reserve0 * amount1 != reserve1 * amount0) {
        throw Error("invalid liquidity");
      }
    }
    let shares = 0;
    if (this.totalSupply.value > 0) {
      shares = Math.sqrt(amount0 * amount1);
    } else {
      shares = Math.min(
        amount0 * this.totalSupply.value / reserve0,
        amount1 * this.totalSupply.value / reserve1
      );
    }
    this.#mint(this.msg.sender, shares);
    this.#update(
      this.#getBankBalance(this.address, this.token0).amount,
      this.#getBankBalance(this.address, this.token1).amount
    );
    return shares;
  }
  removeLiquidity({ shares }) {
    const bal0 = this.#getBankBalance(this.address, this.token0);
    const bal1 = this.#getBankBalance(this.address, this.token1);
    const totalSupply = this.totalSupply.value;
    const amount0 = bal0 * shares / totalSupply;
    const amount1 = bal1 * shares / totalSupply;
    this.#burn(this.msg.sender, shares);
    this.#update(bal0 - amount0, bal1 - amount1);
    sendCoins(this.address, this.msg.sender, {
      [this.token0]: amount0,
      [this.token1]: amount1
    });
    return [amount0, amount1];
  }
};
export {
  store,
  storeEntry
};
export default Contract;
//# sourceMappingURL=bundle2.js.map
