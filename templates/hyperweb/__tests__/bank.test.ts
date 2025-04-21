// @ts-nocheck
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { assertIsDeliverTxSuccess } from '@cosmjs/stargate';

import path from "path";
import fs from 'fs';
import { getSigningHyperwebClient, hyperweb, google } from 'hyperwebjs';
import { useChain, generateMnemonic } from 'starshipjs';
import { sleep } from '../test-utils/sleep';
import './setup.test';

describe('Bank Contract Tests', () => {
    let wallet, denom, address, queryClient, signingClient;
    let chainInfo, getCoin, getRpcEndpoint, creditFromFaucet;
    let contractCode, contractIndex, contractAddress;
    let fee;
    let recipientWallet, recipientAddress;

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

        recipientWallet = await DirectSecp256k1HdWallet.fromMnemonic(generateMnemonic(), {
            prefix: chainInfo.chain.bech32_prefix
        });
        recipientAddress = (await recipientWallet.getAccounts())[0].address;
        console.log(`recipient address: ${recipientAddress}`);

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

    it('Instantiate Bank contract', async () => {
        const contractPath = path.join(
            __dirname,
            "../dist/contracts/bank.js"
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

    it('Call balance function', async () => {
        const args = JSON.stringify({ address, denom });
        const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
            address: contractAddress,
            creator: address,
            callee: "balance",
            args: [args]
        });

        const result = await signingClient.signAndBroadcast(address, [msg], fee);
        assertIsDeliverTxSuccess(result);

        const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
        expect(parseInt(response.result)).toBeGreaterThanOrEqual(0);
    });

    it('Transfer funds to another address and check balance', async () => {
        const transferArgs = JSON.stringify({
            from: address,
            to: recipientAddress,
            amount: 1000,
            denom
        });
        const transferMsg = hyperweb.hvm.MessageComposer.fromPartial.eval({
            address: contractAddress,
            creator: address,
            callee: "transfer",
            args: [transferArgs]
        });

        const transferResult = await signingClient.signAndBroadcast(address, [transferMsg], fee);
        assertIsDeliverTxSuccess(transferResult);

        const checkArgs = JSON.stringify({ address: recipientAddress, denom });
        const checkMsg = hyperweb.hvm.MessageComposer.fromPartial.eval({
            address: contractAddress,
            creator: address,
            callee: "balance",
            args: [checkArgs]
        });

        const checkResult = await signingClient.signAndBroadcast(address, [checkMsg], fee);
        assertIsDeliverTxSuccess(checkResult);

        const checkResponse = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(checkResult.msgResponses[0]);
        console.log(`recipient balance: ${checkResponse.result}`);
        expect(parseInt(checkResponse.result)).toBeGreaterThanOrEqual(1000);
    });

});
