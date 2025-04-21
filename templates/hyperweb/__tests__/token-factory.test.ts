// @ts-nocheck
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { assertIsDeliverTxSuccess } from '@cosmjs/stargate';

import path from "path";
import fs from 'fs';
import { getSigningHyperwebClient, hyperweb, google } from 'hyperwebjs';
import { useChain, generateMnemonic } from 'starshipjs';
import { sleep } from '../test-utils/sleep';
import './setup.test';

describe('Token Factory Contract Tests', () => {
    let wallet, denom, address, queryClient, signingClient;
    let chainInfo, getCoin, getRpcEndpoint, creditFromFaucet;
    let contractCode, contractIndex, contractAddress;
    let fee;
    let fullDenom: string;


    beforeAll(async () => {
        ({
            chainInfo,
            getCoin,
            getRpcEndpoint,
            creditFromFaucet
        } = useChain('hyperweb'));

        denom = (await getCoin()).base;

        wallet = await DirectSecp256k1HdWallet.fromMnemonic(generateMnemonic(), {
            prefix: chainInfo.chain.bech32_prefix
        });
        address = (await wallet.getAccounts())[0].address;
        console.log(`contract creator address: ${address}`);

        queryClient = await hyperweb.ClientFactory.createRPCQueryClient({
            rpcEndpoint: await getRpcEndpoint()
        });

        signingClient = await getSigningHyperwebClient({
            rpcEndpoint: await getRpcEndpoint(),
            signer: wallet
        });

        fee = { amount: [{ denom, amount: '100000' }], gas: '550000' };

        await creditFromFaucet(address);
        await sleep(10000);
    });

    it('Check initial balance', async () => {
        const balance = await signingClient.getBalance(address, denom);
        expect(balance.amount).toEqual("10000000000");
        expect(balance.denom).toEqual(denom);
    });

    it('Instantiate Token Factory contract', async () => {
        const contractPath = path.join(
            __dirname,
            "../dist/contracts/token-factory.js"
        );
        contractCode = fs.readFileSync(contractPath, "utf8");

        const msg = hyperweb.hvm.MessageComposer.fromPartial.instantiate({
            creator: address,
            code: contractCode,
            source: "test_source",
        });

        const result = await signingClient.signAndBroadcast(address, [msg], fee);
        assertIsDeliverTxSuccess(result);

        const response = hyperweb.hvm.MsgInstantiateResponse.fromProtoMsg(result.msgResponses[0]);
        contractIndex = response.index;
        contractAddress = response.address;
        expect(contractIndex).toBeGreaterThan(0);
        console.log(`contract instantiated at index: ${contractIndex} and address ${contractAddress}`);
    });

    it('Create new denom', async () => {
        const args = JSON.stringify({ denom: "testdenom" });
        const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
            address: contractAddress,
            creator: address,
            callee: "createDenom",
            args: [args]
        });

        const result = await signingClient.signAndBroadcast(address, [msg], fee);
        assertIsDeliverTxSuccess(result);

        const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
        fullDenom = response.result;
        console.log("created fullDenom:", fullDenom);
        expect(fullDenom).toContain("factory");
    });

    it('Mint tokens using fullDenom', async () => {
        const args = JSON.stringify({ denom: fullDenom, amount: 1000 });
        const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
            address: contractAddress,
            creator: address,
            callee: "mintTokens",
            args: [args]
        });

        const result = await signingClient.signAndBroadcast(address, [msg], fee);
        assertIsDeliverTxSuccess(result);
    });

    it('Check balance of minted tokens', async () => {
        const args = JSON.stringify({ address, denom: fullDenom });
        const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
            address: contractAddress,
            creator: address,
            callee: "getBalance",
            args: [args]
        });

        const result = await signingClient.signAndBroadcast(address, [msg], fee);
        assertIsDeliverTxSuccess(result);

        const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
        expect(parseInt(response.result)).toBeGreaterThanOrEqual(1000);
    });


});
