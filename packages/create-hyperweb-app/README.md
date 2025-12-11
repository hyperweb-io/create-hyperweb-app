# create-hyperweb-app

<p align="center" width="100%">
    <img height="148" src="https://github.com/user-attachments/assets/f672f9b8-e59a-4f44-8f51-df3e8d2eaae5" />
</p>

<p align="center" width="100%">
   <a href="https://www.npmjs.com/package/create-hyperweb-app"><img height="20" src="https://img.shields.io/npm/dt/create-hyperweb-app"></a>
   <a href="https://github.com/hyperweb-io/create-hyperweb-app/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
   <a href="https://www.npmjs.com/package/create-hyperweb-app"><img height="20" src="https://img.shields.io/github/package-json/v/hyperweb-io/create-hyperweb-app?filename=packages%2Fcreate-hyperweb-app%2Fpackage.json"></a>
</p>

Set up a Hyperweb app by running one command ⚛️

- [Overview](#overview)
- [Education & Resources](#education--resources)
- [Creating an App](#creating-an-app)
- [Examples](#examples)
- [Options](#options)
- [Development](#development)

## Overview

First, install `create-hyperweb-app` globally using npm:

```sh
npm install -g create-hyperweb-app
```

Then, create your new Cosmos app by running the following command:

```sh
# you can also use `cha` instead of `create-hyperweb-app` for shortcut ;)
create-hyperweb-app
```

During the setup process, you'll be prompted to enter the name of your app. For example:

```plaintext
> name: my-app
```

Once the app is created, move into the app directory and start the development server:

```sh
cd my-app
yarn && yarn dev
```

Now your app should be running on `http://localhost:3000`!

### Get Started Immediately

You don’t need to install or configure cosmjs, keplr, nextjs, webpack or Babel.

Everything is preconfigured, ready-to-go, so you can focus on your code!

- ⚡️ Connect easily to 20+ wallets via [Cosmos Kit](https://github.com/hyperweb-io/cosmos-kit) — including Ledger, Keplr, Cosmostation, Leap, Trust Wallet, OKX, XDEFI, Exodus, Wallet Connect and more!
- ⚛️ Sign and broadcast with [cosmjs](https://github.com/cosmos/cosmjs) stargate + cosmwasm signers
<!-- - 🎨 Build awesome UI with [Interchain UI](https://hyperweb.io/stack/interchain-ui) and [Explore Components](https://cosmology.zone/components) -->
- 🛠 Render pages with [next.js](https://nextjs.org/) hybrid static & server rendering
<!-- - 📝 Leverage [chain-registry](https://github.com/hyperweb-io/chain-registry) for Chain and Asset info for all Cosmos chains -->
- 🚀 Ensure reliability with [Starship](https://github.com/hyperweb-io/starship), our end-to-end testing CI/CD project for GitHub Actions, streamlining continuous integration and delivery across the interchain ecosystem.

<!-- ## Education & Resources

🎥 [Checkout our videos](https://cosmology.zone/learn) to learn to learn more about `create-hyperweb-app` and tooling for building frontends in the Cosmos!

Checkout [cosmos-kit](https://github.com/hyperweb-io/cosmos-kit) for more docs as well as [cosmos-kit/react](https://github.com/hyperweb-io/cosmos-kit/tree/main/packages/react#signing-clients) for getting cosmjs stargate and cosmjs signers. -->

## Creating an App

To create a new app, you may choose one of the following methods:

### global install

```sh
npm install -g create-hyperweb-app
```

Then run the command:

```sh
create-hyperweb-app
```

we also made an alias `cha` if you don't want to type `create-hyperweb-app`:

```sh
cha
```

### npx

```sh
npx create-hyperweb-app
```

### npm

```sh
npm init hyperweb-app
```

### Yarn

```sh
yarn create hyperweb-app
```

## Options

| Argument             | Description                                    | Default    |
|----------------------|------------------------------------------------|------------|
| `--repo`             | Set custom repository for cha templates        | None       |
| `--install`          | Automatically install dependencies             | `true`     |
| `--printCmd`         | Print the command to run after setup           | `true`     |
| `-n`, `--name`       | Provide a project name                         | None       |
| `-e`, `--example`    | Provide an example name                        | None       |
| `-t`, `--template`   | Define the template to use                     | None       |
| `-b`, `--fromBranch` | Specify the branch to use for cloning          | None       |

## Interchain JavaScript Stack ⚛️

A unified toolkit for building applications and smart contracts in the Interchain ecosystem

| Category              | Tools                                                                                                                  | Description                                                                                           |
|----------------------|------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| **Chain Information**   | [**Chain Registry**](https://github.com/hyperweb-io/chain-registry), [**Utils**](https://www.npmjs.com/package/@chain-registry/utils), [**Client**](https://www.npmjs.com/package/@chain-registry/client) | Everything from token symbols, logos, and IBC denominations for all assets you want to support in your application. |
| **Wallet Connectors**| [**Interchain Kit**](https://github.com/hyperweb-io/interchain-kit)<sup>beta</sup>, [**Cosmos Kit**](https://github.com/hyperweb-io/cosmos-kit) | Experience the convenience of connecting with a variety of web3 wallets through a single, streamlined interface. |
| **Signing Clients**          | [**InterchainJS**](https://github.com/hyperweb-io/interchainjs)<sup>beta</sup>, [**CosmJS**](https://github.com/cosmos/cosmjs) | A single, universal signing interface for any network |
| **SDK Clients**              | [**Telescope**](https://github.com/hyperweb-io/telescope)                                                          | Your Frontend Companion for Building with TypeScript with Cosmos SDK Modules. |
| **Starter Kits**     | [**Create Interchain App**](https://github.com/hyperweb-io/create-interchain-app)<sup>beta</sup>, [**Create Cosmos App**](https://github.com/hyperweb-io/create-cosmos-app) | Set up a modern Interchain app by running one command. |
| **UI Kits**          | [**Interchain UI**](https://github.com/hyperweb-io/interchain-ui)                                                   | The Interchain Design System, empowering developers with a flexible, easy-to-use UI kit. |
| **Testing Frameworks**          | [**Starship**](https://github.com/hyperweb-io/starship)                                                             | Unified Testing and Development for the Interchain. |
| **TypeScript Smart Contracts** | [**Create Hyperweb App**](https://github.com/hyperweb-io/create-hyperweb-app)                              | Build and deploy full-stack blockchain applications with TypeScript |
| **CosmWasm Contracts** | [**CosmWasm TS Codegen**](https://github.com/CosmWasm/ts-codegen)                                                   | Convert your CosmWasm smart contracts into dev-friendly TypeScript classes. |

## Credits

🛠 Built by the [Constructive](https://constructive.io) team — makers of [Hyperweb](https://hyperweb.io)

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
