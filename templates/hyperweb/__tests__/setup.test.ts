import path from "path";

import { SigningClient } from "@interchainjs/cosmos/signing-client";
import { DirectGenericOfflineSigner } from "@interchainjs/cosmos/types/wallet";
import { Secp256k1HDWallet } from "@interchainjs/cosmos/wallets/secp256k1hd";
import {
  ConfigContext,
  generateMnemonic,
  useChain,
  useRegistry,
} from "starshipjs";

beforeAll(async () => {
  const configFile = path.join(__dirname, "..", "configs", "local.yaml");
  ConfigContext.setConfigFile(configFile);
  ConfigContext.setRegistry(await useRegistry(configFile));
});

describe("Test clients", () => {
  let client: SigningClient;

  beforeAll(async () => {
    const { getRpcEndpoint, chainInfo } = useChain("hyperweb");

    const commonPrefix = chainInfo?.chain?.bech32_prefix;
    const cosmosHdPath = "m/44'/118'/0'/0/0";

    const directWallet = Secp256k1HDWallet.fromMnemonic(generateMnemonic(), [
      {
        prefix: commonPrefix,
        hdPath: cosmosHdPath,
      },
    ]);
    const directSigner = directWallet.toOfflineDirectSigner();

    client = await SigningClient.connectWithSigner(
      await getRpcEndpoint(),
      new DirectGenericOfflineSigner(directSigner),
      {
        signerOptions: {
          prefix: commonPrefix,
        },
      }
    );
  });

  it("check chain height", async () => {
    const { header } = await client.getBlock(1);

    expect(header.height).toBeGreaterThan(0);
  });
});
