import { useState } from 'react';
import { Box, Text } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';
import { DeliverTxResponse } from 'hyperwebjs';

import {
  formatTxFee,
  getContractIndex,
  shortenAddress,
  readFileContent,
} from '@/utils';
import { InputField } from '../common';
import { useChainStore } from '@/contexts';
import { Button } from '../../common';
import { useInstantiateTx, useMyContracts } from '@/hooks';
import { TxInfoItem, TxSuccessDisplay } from './TxSuccessDisplay';
import { TabLabel } from '@/pages/contract';
import { FileUploader } from './FileUploader';

type DeployJsContractProps = {
  show?: boolean;
  switchTab?: (addressValue: string, tabId: number) => void;
  onSuccess?: () => void;
  onCreateNewContract?: () => void;
  onViewMyContracts?: () => void;
};

export const DeployJsContract = ({
  show = true,
  onSuccess,
  switchTab,
  onCreateNewContract,
  onViewMyContracts,
}: DeployJsContractProps) => {
  const [jsFile, setJsFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txResult, setTxResult] = useState<DeliverTxResponse>();

  const { selectedChain } = useChainStore();
  const { address, assetList } = useChain(selectedChain);
  const { instantiateJsdTx } = useInstantiateTx(selectedChain);
  const { refetch: updateMyContracts } = useMyContracts();

  const handleDeploy = async () => {
    if (!address || !jsFile) return;

    setIsLoading(true);

    instantiateJsdTx({
      address,
      code: await readFileContent(jsFile),
      onTxSucceed: (txInfo) => {
        setIsLoading(false);
        setTxResult(txInfo);
        updateMyContracts();
        onSuccess?.();
      },
      onTxFailed: () => {
        setIsLoading(false);
      },
    });
  };

  const resetStates = () => {
    setJsFile(null);
    setTxResult(undefined);
  };

  const isButtonDisabled = !address || !jsFile;

  if (txResult) {
    const txFee =
      txResult.events.find((e) => e.type === 'tx')?.attributes[0].value ?? '';

    const contractIndex = getContractIndex(txResult);

    const infoItems: TxInfoItem[] = [
      {
        label: 'Contract Index',
        value: contractIndex,
        copyValue: contractIndex,
        showCopy: true,
      },
      {
        label: 'Tx Hash',
        value: shortenAddress(txResult.transactionHash),
        copyValue: txResult.transactionHash,
        showCopy: true,
      },
      {
        label: 'Tx Fee',
        value: formatTxFee(txFee, assetList),
      },
    ];

    return (
      <TxSuccessDisplay
        show={show}
        infoItems={infoItems}
        txResult={txResult}
        footer={
          <Box
            width="$full"
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            gap="10px"
          >
            <Button
              width="$full"
              variant="primary"
              onClick={() => {
                switchTab?.(contractIndex, TabLabel.Query);
              }}
            >
              Query
            </Button>
            <Button
              width="$full"
              variant="primary"
              onClick={() => {
                switchTab?.(contractIndex, TabLabel.Execute);
              }}
            >
              Execute
            </Button>
            <Button
              width="$full"
              onClick={() => {
                resetStates();
                onCreateNewContract?.();
              }}
            >
              Create New Contract
            </Button>
            <Button width="$full" onClick={onViewMyContracts}>
              View My Contracts
            </Button>
          </Box>
        }
      />
    );
  }

  return (
    <Box
      display={show ? 'flex' : 'none'}
      flexDirection="column"
      gap="20px"
      mt="40px"
      maxWidth="560px"
      mx="auto"
    >
      <Text
        fontSize="24px"
        fontWeight="500"
        color="$blackAlpha600"
        textAlign="center"
      >
        Deploy Contract
      </Text>

      <InputField title="Contract File" required>
        <FileUploader file={jsFile} setFile={setJsFile} type="js" />
      </InputField>

      <Button
        variant="primary"
        onClick={handleDeploy}
        disabled={isButtonDisabled}
        isLoading={isLoading}
        mx="auto"
      >
        Deploy
      </Button>
    </Box>
  );
};
