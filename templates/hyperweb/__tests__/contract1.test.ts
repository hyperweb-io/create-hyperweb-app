// @ts-nocheck
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { assertIsDeliverTxSuccess } from '@cosmjs/stargate';

import path from "path";
import fs from 'fs';
import { getSigningJsdClient, jsd } from 'jsdjs'
import { useChain, generateMnemonic } from 'starshipjs';
import { sleep } from '../test-utils/sleep';
import './setup.test';

describe('JSD tests', () => {
  let wallet, denom, address, queryClient, signingClient;
  let chainInfo, getCoin, getRpcEndpoint, creditFromFaucet;
  let contractCode, contractIndex;

  let fee;

  beforeAll(async () => {
    ({
      chainInfo,
      getCoin,
      getRpcEndpoint,
      creditFromFaucet
    } = useChain('hyperweb'));
    denom = (await getCoin()).base;

    // Initialize wallet
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(generateMnemonic(), {
      prefix: chainInfo.chain.bech32_prefix
    });
    address = (await wallet.getAccounts())[0].address;
    console.log(`contract creator address: ${address}`)

    // Create custom cosmos interchain client
    queryClient = await jsd.ClientFactory.createRPCQueryClient({
      rpcEndpoint: await getRpcEndpoint()
    });

    signingClient = await getSigningJsdClient({
      rpcEndpoint: await getRpcEndpoint(),
      signer: wallet
    });

    // set default fee
    fee = {amount: [{denom, amount: '100000'}], gas: '550000'};

    await creditFromFaucet(address);
    await sleep(2000); // sleep for 1 sec to get tokens transferred from faucet successfully
  });

  it('check balance', async () => {
    const balance = await signingClient.getBalance(address, denom);
    expect(balance.amount).toEqual("10000000000");
    expect(balance.denom).toEqual(denom);
  });

  it('instantiate contract', async () => {
    // Read contract code from external file
    const contractPath = path.join(__dirname, '../dist/contracts/bundle1.js');
    contractCode = fs.readFileSync(contractPath, 'utf8');

    const msg = jsd.jsd.MessageComposer.fromPartial.instantiate({
      creator: address,
      code: contractCode,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    // Parse the response to get the contract index
    const response = jsd.jsd.MsgInstantiateResponse.fromProtoMsg(result.msgResponses[0]);
    contractIndex = response.index;
    expect(contractIndex).toBeGreaterThan(0);
    console.log(`contract index: ${contractIndex}`);
  });

  it('query for contract based on index', async () => {
    const response = await queryClient.jsd.jsd.contracts({index: contractIndex});
    expect(response.contracts.code).toEqual(contractCode);
    expect(response.contracts.index).toEqual(contractIndex);
    expect(response.contracts.creator).toEqual(address);
  });

  it('query state before eval', async () => {
    const state = await queryClient.jsd.jsd.localState({index: contractIndex, key: "value"});
    expect(state).toEqual({value: ""});
  });

  it('perform inc eval', async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "inc",
      arg: `{"x": 10}`,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("10");
  });

  it('eval read from eval', async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "read",
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("10");
  });

  it('query state after eval', async () => {
    const state = await queryClient.jsd.jsd.localState({index: contractIndex, key: "value"});
    expect(state).toEqual({value: "10"});
  });

  it('perform dec eval', async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "dec",
      arg: `{"x": 5}`,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("5");
  });

  it('eval read from eval', async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "read",
      arg: "",
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("5");
  });
});
