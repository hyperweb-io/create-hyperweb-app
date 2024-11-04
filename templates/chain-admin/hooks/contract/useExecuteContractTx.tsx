import { Coin, StdFee } from '@cosmjs/amino';
import { useChain } from '@cosmos-kit/react';
import { getSigningJsdClient, jsd } from 'hyperwebjs';
import { useHandleTx } from './useHandleTx';

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
  const { getSigningCosmWasmClient, getRpcEndpoint, getOfflineSigner } =
    useChain(chainName);
  const handleTx = useHandleTx(chainName);

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
        const client = await getSigningCosmWasmClient();

        return client.execute(
          address,
          contractAddress,
          msg,
          fee,
          undefined,
          funds
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
    const msg = jsd.jsd.MessageComposer.fromPartial.eval({
      creator: address,
      index: BigInt(contractIndex),
      fnName,
      arg,
    });

    const fee = { amount: [], gas: '550000' };

    await handleTx({
      txFunction: async () => {
        const signingClient = await getSigningJsdClient({
          rpcEndpoint: await getRpcEndpoint(),
          signer: getOfflineSigner(),
        });

        return signingClient.signAndBroadcast(address, [msg], fee);
      },
      onTxSucceed,
      onTxFailed,
    });
  };

  return { executeTx, executeJsdTx };
};
