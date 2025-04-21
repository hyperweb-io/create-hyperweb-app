// @ts-ignore
import { getBalance, sendCoins } from "@hyperweb/bank";

export default class Contract {
    constructor() { }

    balance({ address, denom }: { address: string; denom: string }): string {
        console.log("checking balance for address:", address, "denom:", denom);
        return getBalance(address, denom).amount.toString();
    }

    transfer({ from, to, amount, denom }: {
        from: string;
        to: string;
        amount: number;
        denom: string
    }): string {
        console.log("transferring", amount, "of", denom, "from", from, "to", to);
        sendCoins(from, to, `${amount}${denom}`);
        return "Transfer successful";
    }
}