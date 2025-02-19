// @ts-nocheck
import { Secp256k1HDWallet } from "@interchainjs/cosmos/wallets/secp256k1hd";
import { assertIsDeliverTxSuccess } from "@interchainjs/cosmos/utils";

import path from "path";
import fs from "fs";
import { getSigningJsdClient, jsd } from "hyperwebjs";
import { useChain, generateMnemonic } from "starshipjs";
import { sleep } from "../test-utils/sleep";
import "./setup.test";
import { DirectGenericOfflineSigner } from "@interchainjs/cosmos/types/wallet";

describe("Simple state tests", () => {
  let wallet, denom, address, queryClient, signingClient;
  let chainInfo, getCoin, getRpcEndpoint, creditFromFaucet;
  let contractCode, contractIndex;

  let fee;

  beforeAll(async () => {
    ({ chainInfo, getCoin, getRpcEndpoint, creditFromFaucet } =
      useChain("hyperweb"));
    denom = (await getCoin()).base;

    // Initialize wallet
    wallet = Secp256k1HDWallet.fromMnemonic(generateMnemonic(), [
      {
        prefix: chainInfo.chain.bech32_prefix,
        hdPath: "m/44'/118'/0'/0/0",
      },
    ]);
    address = (await wallet.getAccounts())[0].address;
    console.log(`contract creator address: ${address}`);

    // Create custom cosmos interchain client
    queryClient = await jsd.ClientFactory.createRPCQueryClient({
      rpcEndpoint: await getRpcEndpoint(),
    });

    signingClient = await getSigningJsdClient({
      rpcEndpoint: await getRpcEndpoint(),
      signer: wallet,
    });

    // set default fee
    fee = { amount: [{ denom, amount: "100000" }], gas: "550000" };

    await creditFromFaucet(address);
    await sleep(2000); // sleep for 1 sec to get tokens transferred from faucet successfully
  });

  it("check balance", async () => {
    const balance = await signingClient.getBalance(address, denom);
    expect(balance.amount).toEqual("10000000000");
    expect(balance.denom).toEqual(denom);
  });

  it("instantiate contract", async () => {
    // Read contract code from external file
    const contractPath = path.join(
      __dirname,
      "../dist/contracts/simpleState.js"
    );
    contractCode = fs.readFileSync(contractPath, "utf8");

    const msg = jsd.jsd.MessageComposer.fromPartial.instantiate({
      creator: address,
      code: contractCode,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    // Parse the response to get the contract index
    const response = jsd.jsd.MsgInstantiateResponse.fromProtoMsg(
      result.msgResponses[0]
    );
    contractIndex = response.index;
    expect(contractIndex).toBeGreaterThan(0);
    console.log(`contract index: ${contractIndex}`);
  });

  it("query for contract based on index", async () => {
    const response = await queryClient.jsd.jsd.contracts({
      index: contractIndex,
    });
    expect(response.contracts.code).toEqual(contractCode);
    expect(response.contracts.index).toEqual(contractIndex);
    expect(response.contracts.creator).toEqual(address);
  });

  it("query state before eval", async () => {
    const state = await queryClient.jsd.jsd.localState({
      index: contractIndex,
      key: "value",
    });
    expect(state).toEqual({ value: "" });
  });

  it("perform inc eval", async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "inc",
      arg: `{"x": 10}`,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(
      result.msgResponses[0]
    );
    expect(response.result).toEqual("10");
  });

  it("eval read from eval", async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "read",
      arg: "",
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(
      result.msgResponses[0]
    );
    expect(response.result).toEqual("10");
  });

  it("query state after eval", async () => {
    const state = await queryClient.jsd.jsd.localState({
      index: contractIndex,
      key: "value",
    });
    expect(state).toEqual({ value: "10" });
  });

  it("perform dec eval", async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "dec",
      arg: `{"x": 5}`,
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(
      result.msgResponses[0]
    );
    expect(response.result).toEqual("5");
  });

  it("eval read from eval", async () => {
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: contractIndex,
      fnName: "read",
      arg: "",
    });

    const result = await signingClient.signAndBroadcast(address, [msg], fee);
    assertIsDeliverTxSuccess(result);

    const response = jsd.jsd.MsgEvalResponse.fromProtoMsg(
      result.msgResponses[0]
    );
    expect(response.result).toEqual("5");
  });
});
