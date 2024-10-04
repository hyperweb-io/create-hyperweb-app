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

  let wallet2, address2;
  let fee;

  const denom2 = "uweb", denomATOM = "ATOM", denomUSDC = "USDC";

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

    // Initialize wallet2
    wallet2 = await DirectSecp256k1HdWallet.fromMnemonic(generateMnemonic(), {
      prefix: chainInfo.chain.bech32_prefix
    });
    address2 = (await wallet2.getAccounts())[0].address;
    console.log(`contract creator address: ${address2}`)

    // Create custom cosmos interchain client
    queryClient = await jsd.ClientFactory.createRPCQueryClient({
      rpcEndpoint: await getRpcEndpoint()
    });

    signingClient = await getSigningJsdClient({
      rpcEndpoint: await getRpcEndpoint(),
      signer: wallet
    });

    await creditFromFaucet(address, denom);
    await creditFromFaucet(address, denom2);
    await creditFromFaucet(address, denomATOM);
    await creditFromFaucet(address, denomUSDC);

    await creditFromFaucet(address2, denom);
    await creditFromFaucet(address2, denom2);

    fee = {amount: [{denom, amount: '100000'}], gas: '550000'};

    await sleep(2000); // sleep for 1 sec to get tokens transferred from faucet successfully
  });

  it('check balance', async () => {
    const balance = await signingClient.getBalance(address, denom);
    expect(balance.amount).toEqual("10000000000");
    expect(balance.denom).toEqual(denom);
  });

  it('instantiate contract', async () => {
    // Read contract code from external file
    const contractPath = path.join(__dirname, '../dist/contracts/bundle2.js');
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

  it('perform getTotalSupply eval', async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "getTotalSupply",
      arg: `{}`,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("0");
  });

  it('perform addLiquidity eval', async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "addLiquidity",
      arg: `{"amount0":50, "amount1":50}`,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("null");
  });

  it('check balance after addLiquidity', async () => {
    const usdcBalance = await signingClient.getBalance(address, "USDC");
    expect(usdcBalance.amount).toEqual("9999999950");

    const atomBalance = await signingClient.getBalance(address, "ATOM");
    expect(atomBalance.amount).toEqual("9999999950");
  });

  it('perform swap eval', async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "swap",
      arg: `{"tokenIn":"USDC","amountIn":10}`,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("8.312489578122396");
  });
});
