// @ts-ignore
import { createDenom, mintTokens, burnTokens } from '@hyperweb/token';
// @ts-ignore
import { getBalance } from '@hyperweb/bank';

export default class Contract {
    private msg: { sender: string };
    constructor() { }

    createDenom({ denom }: { denom: string }) {
        console.log("denom:", denom);
        const token = createDenom(this.msg.sender, denom);
        console.log("created token:", token);
        return token;
    }

    mintTokens({ denom, amount }: { denom: string; amount: number }) {
        console.log("minting tokens:", amount, "of", denom);
        const minted = mintTokens(this.msg.sender, denom, amount);
        console.log("minted:", minted);
        return minted;
    }

    burnTokens({ denom, amount }: { denom: string; amount: number }) {
        console.log("burning tokens:", amount, "of", denom);
        const burned = burnTokens(this.msg.sender, denom, amount);
        console.log("burned:", burned);
        return burned;
    }

    getBalance({ address, denom }: { address: string; denom: string }) {
        console.log("checking balance for address:", address, "denom:", denom);
        const balance = getBalance(address, denom);
        console.log("balance:", balance.amount);
        return balance.amount;
    }
}
