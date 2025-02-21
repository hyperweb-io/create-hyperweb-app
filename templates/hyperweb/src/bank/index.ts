// @ts-ignore
import { getBalance, sendCoins } from "@hyperweb/bank";

export default class Contract {
    constructor() { }

    balance({ address, denom }: { address: string; denom: string }): string {
        return getBalance(address, denom).amount.toString();
    }

    transfer({ from, to, amount, denom }: {
        from: string;
        to: string;
        amount: number;
        denom: string
    }): string {
        sendCoins(from, to, { [denom]: amount });
        return "Transfer successful";
    }
}