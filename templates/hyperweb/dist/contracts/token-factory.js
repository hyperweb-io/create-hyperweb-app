// src/token-factory/index.ts
import { createDenom, mintTokens, burnTokens } from "@hyperweb/token";
import { getBalance } from "@hyperweb/bank";
var Contract = class {
  msg;
  constructor() {
  }
  createDenom({ denom }) {
    console.log("denom:", denom);
    const token = createDenom(this.msg.sender, denom);
    console.log("created token:", token);
    return token;
  }
  mintTokens({ denom, amount }) {
    console.log("minting tokens:", amount, "of", denom);
    const minted = mintTokens(this.msg.sender, denom, amount);
    console.log("minted:", minted);
    return minted;
  }
  burnTokens({ denom, amount }) {
    console.log("burning tokens:", amount, "of", denom);
    const burned = burnTokens(this.msg.sender, denom, amount);
    console.log("burned:", burned);
    return burned;
  }
  getBalance({ address, denom }) {
    console.log("checking balance for address:", address, "denom:", denom);
    const balance = getBalance(address, denom);
    console.log("balance:", balance.amount);
    return balance.amount;
  }
};
export {
  Contract as default
};
//# sourceMappingURL=token-factory.js.map
