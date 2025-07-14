import { useChain } from '@interchain-kit/react';
import { hyperweb, getSigningHyperwebClient } from 'hyperwebjs';
import { executeContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.func';
import { StdFee } from '@interchainjs/react/types';
import { Coin } from '@interchainjs/react/cosmos/base/v1beta1/coin';

import { toUint8Array } from '@/utils';

import { useHandleTx } from './useHandleTx';
import { useRpcEndpoint } from '../common';
import { useJsdQueryClient } from './useJsdQueryClient';

interface ExecuteTxParams {
  address: string;
  contractAddress: string;
  fee: StdFee;
  msg: object;
  funds: Coin[];
  onTxSucceed?: () => void;
  onTxFailed?: () => void;
}

interface ExecuteJsdTxParams {
  address: string;
  contractIndex: string;
  fnName: string;
  arg: string;
  onTxSucceed?: () => void;
  onTxFailed?: () => void;
}

export const useExecuteContractTx = (chainName: string) => {
  const { data: rpcEndpoint } = useRpcEndpoint(chainName);
  const { chain, wallet } = useChain(chainName);
  const handleTx = useHandleTx(chainName);
  const { data: jsdQueryClient } = useJsdQueryClient();

  const executeTx = async ({
    address,
    contractAddress,
    fee,
    funds,
    msg,
    onTxFailed = () => {},
    onTxSucceed = () => {},
  }: ExecuteTxParams) => {
    await handleTx({
      txFunction: async () => {
        throw new Error(
          'WASM contract execution not supported in hyperwebjs 1.1.1. Use executeJsdTx for JS contracts.'
        );
      },
      onTxSucceed,
      onTxFailed,
    });
  };

  const executeJsdTx = async ({
    address,
    contractIndex,
    fnName,
    arg,
    onTxFailed = () => {},
    onTxSucceed = () => {},
  }: ExecuteJsdTxParams) => {
    const fee = { amount: [], gas: '550000' };

    await handleTx({
      txFunction: async () => {
        if (!rpcEndpoint) {
          throw new Error('RPC endpoint is not available');
        }

        const chainId = chain.chainId ?? '';

        if (!(window as any).keplr) {
          throw new Error('Keplr wallet not available');
        }

        if (!jsdQueryClient) {
          throw new Error('Query client not available');
        }

        // Get contract address from contract index using listContracts
        const contractsResponse =
          await jsdQueryClient.hyperweb.hvm.listContracts({
            pagination: {
              limit: 1000n,
              reverse: true,
              countTotal: false,
              key: new Uint8Array(),
              offset: 0n,
            },
          });

        const contractInfo = contractsResponse.contracts.find(
          (contract) => contract.index.toString() === contractIndex
        );

        if (!contractInfo) {
          throw new Error(`Contract not found for index ${contractIndex}`);
        }

        // Debug: Log the contract info structure
        console.log('Contract Info:', contractInfo);
        console.log('Contract Info Keys:', Object.keys(contractInfo));

        // Try to extract contract address from different possible fields
        let contractAddress;

        // Try common field names
        if ((contractInfo as any).address) {
          contractAddress = (contractInfo as any).address;
        } else if ((contractInfo as any).contractAddress) {
          contractAddress = (contractInfo as any).contractAddress;
        } else if (
          (contractInfo as any).contract &&
          (contractInfo as any).contract.address
        ) {
          contractAddress = (contractInfo as any).contract.address;
        } else {
          // If we can't find the address, let's try using the index directly
          // as the system might expect it
          contractAddress = contractIndex;
          console.warn(
            'Could not find contract address field, using index directly'
          );
        }

        if (!contractAddress) {
          throw new Error(
            `Contract address not found for index ${contractIndex}`
          );
        }

        // Create signing client using hyperwebjs 1.1.1
        const signingClient = await getSigningHyperwebClient({
          rpcEndpoint,
          signer: (window as any).keplr.getOfflineSigner(chainId),
        });

        const msg = hyperweb.hvm.MessageComposer.fromPartial.eval({
          address: contractAddress, // Use the contract address from getContractByIndex
          creator: address,
          callee: fnName,
          args: [arg],
        });

        const result = await signingClient.signAndBroadcast(
          address,
          [msg],
          fee
        );
        return result;
      },
      onTxSucceed,
      onTxFailed,
    });
  };

  return { executeTx, executeJsdTx };
};
