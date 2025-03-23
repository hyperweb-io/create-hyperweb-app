// @ts-nocheck
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { assertIsDeliverTxSuccess } from '@cosmjs/stargate';

import path from "path";
import fs from 'fs';
import { getSigningHyperwebClient, hyperweb, google } from 'hyperwebjs';
import { useChain, generateMnemonic } from 'starshipjs';
import { sleep } from '../test-utils/sleep';
import './setup.test';

describe('Hello Contract Tests', () => {
  let wallet, denom, address, queryClient, signingClient;
  let chainInfo, getCoin, getRpcEndpoint, creditFromFaucet;
  let contractCode, contractIndex, contractAddress;
  let fee;

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
    console.log(`Contract creator address: ${address}`);

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

  it('Instantiate hello contract', async () => {
    const contractPath = path.join(
      __dirname,
      "../dist/contracts/hello.js"
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

  it('Invoke hello function', async () => {
    const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
      address: contractAddress,
      creator: address,
      callee: "hello",
      args: [JSON.stringify("World")]
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("Hello, World");
  });

});
