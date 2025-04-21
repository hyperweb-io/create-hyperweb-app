// src/bank/index.ts
import { getBalance, sendCoins } from "@hyperweb/bank";
var Contract = class {
  constructor() {
  }
  balance({ address, denom }) {
    console.log("checking balance for address:", address, "denom:", denom);
    return getBalance(address, denom).amount.toString();
  }
  transfer({ from, to, amount, denom }) {
    console.log("transferring", amount, "of", denom, "from", from, "to", to);
    sendCoins(from, to, `${amount}${denom}`);
    return "Transfer successful";
  }
};
export {
  Contract as default
};
//# sourceMappingURL=bank.js.map
