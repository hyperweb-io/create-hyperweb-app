// @ts-nocheck
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { assertIsDeliverTxSuccess } from '@cosmjs/stargate';

import path from "path";
import fs from 'fs';
import { getSigningHyperwebClient, hyperweb, google } from 'hyperwebjs';
import { useChain, generateMnemonic } from 'starshipjs';
import { sleep } from '../test-utils/sleep';
import './setup.test';

describe('State Contract Tests', () => {
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

    // Initialize wallet
    wallet = await DirectSecp256k1HdWallet.fromMnemonic(generateMnemonic(), {
      prefix: chainInfo.chain.bech32_prefix
    });
    address = (await wallet.getAccounts())[0].address;
    console.log(`Contract creator address: ${address}`);

    // Create custom cosmos interchain client
    queryClient = await hyperweb.ClientFactory.createRPCQueryClient({
      rpcEndpoint: await getRpcEndpoint()
    });

    signingClient = await getSigningHyperwebClient({
      rpcEndpoint: await getRpcEndpoint(),
      signer: wallet
    });

    // Set default transaction fee
    fee = { amount: [{ denom, amount: '100000' }], gas: '550000' };

    await creditFromFaucet(address);
    await sleep(10000); // Sleep for 2 sec to allow faucet tokens to arrive
  });

  it('Check initial balance', async () => {
    const balance = await signingClient.getBalance(address, denom);
    expect(balance.amount).toEqual("10000000000");
    expect(balance.denom).toEqual(denom);
  });

  it('Instantiate state contract', async () => {
    // Read contract code from external file
    const contractPath = path.join(
      __dirname,
      "../dist/contracts/simple-state.js"
    );
    contractCode = fs.readFileSync(contractPath, "utf8");

    const msg = hyperweb.hvm.MessageComposer.fromPartial.instantiate({
      creator: address,
      code: contractCode,
      source: "test_source",
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    // Parse the response to get the contract index
    const response = hyperweb.hvm.MsgInstantiateResponse.fromProtoMsg(result.msgResponses[0]);
    contractIndex = response.index;
    contractAddress = response.address;
    expect(contractIndex).toBeGreaterThan(0);
    console.log(`Contract instantiated at index: ${contractIndex} and address ${contractAddress}`);
  });

  it('Perform init function', async () => {
    const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
      address: contractAddress,
      creator: address,
      callee: "init",
      args: []
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("0");
  });

  it('Perform increment evaluation', async () => {
    const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
      address: contractAddress,
      creator: address,
      callee: "inc",
      args: ["10"]
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
    expect(response.result).toEqual("10");
  });
  //
  // it('Perform decrement evaluation', async () => {
  //   const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
  //     creator: address,
  //     callee: "dec",
  //     index: contractIndex,
  //     args: []
  //   });
  //
  //   const result = await signingClient.signAndBroadcast(address, [msg], fee);
  //   assertIsDeliverTxSuccess(result);
  //
  //   const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
  //   expect(response.result).toEqual("0");
  // });
  //
  // it('Perform multiple increments and verify state', async () => {
  //   for (let i = 0; i < 3; i++) {
  //     const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
  //       creator: address,
  //       callee: "inc",
  //       index: contractIndex,
  //       args: []
  //     });
  //
  //     const result = await signingClient.signAndBroadcast(address, [msg], fee);
  //     assertIsDeliverTxSuccess(result);
  //   }
  //
  //   const msgRead = hyperweb.hvm.MessageComposer.fromPartial.eval({
  //     creator: address,
  //     callee: "read",
  //     index: contractIndex,
  //     args: []
  //   });
  //
  //   const result = await signingClient.signAndBroadcast(address, [msgRead], fee);
  //   assertIsDeliverTxSuccess(result);
  //
  //   const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
  //   expect(response.result).toEqual("3");
  // });
  //
  // it('Perform reset and verify state', async () => {
  //   const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
  //     creator: address,
  //     callee: "reset",
  //     index: contractIndex,
  //     args: []
  //   });
  //
  //   const result = await signingClient.signAndBroadcast(address, [msg], fee);
  //   assertIsDeliverTxSuccess(result);
  //
  //   const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
  //   expect(response.result).toEqual("0");
  // });
  //
  // it('Verify read function returns the correct state value', async () => {
  //   const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
  //     creator: address,
  //     callee: "read",
  //     index: contractIndex,
  //     args: []
  //   });
  //
  //   const result = await signingClient.signAndBroadcast(address, [msg], fee);
  //   assertIsDeliverTxSuccess(result);
  //
  //   const response = hyperweb.hvm.MsgEvalResponse.fromProtoMsg(result.msgResponses[0]);
  //   expect(response.result).toEqual("0");
  // });
  //
  // it('Retrieve contract source and validate', async () => {
  //   const contractSource = await queryClient.hyperweb.hvm.getContractSource({ index: contractIndex });
  //   expect(contractSource.source).toEqual("test_source");
  // });
});
