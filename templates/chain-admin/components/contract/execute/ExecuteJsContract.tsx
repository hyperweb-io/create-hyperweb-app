import { useMemo, useState } from 'react';
import { Box, Text, TextField } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';

import { InputField, JsonInput, ContractIndexField } from '../common';
import { Button } from '../../common';
import { validateJson } from '@/utils';
import { useChainStore } from '@/contexts';
import { useExecuteContractTx } from '@/hooks';

const INPUT_LINES = 12;

type ExecuteJsContractProps = {
  show: boolean;
  indexValue: string;
  onIndexInput: (input: string) => void;
};

export const ExecuteJsContract = ({
  show,
  indexValue,
  onIndexInput,
}: ExecuteJsContractProps) => {
  const [contractIndex, setContractIndex] = useState('');
  const [fnName, setFnName] = useState('');
  const [arg, setArg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { selectedChain } = useChainStore();
  const { address, connect } = useChain(selectedChain);
  const { executeJsdTx } = useExecuteContractTx(selectedChain);

  const handleExecute = () => {
    if (!address) {
      connect();
      return;
    }

    setIsLoading(true);

    executeJsdTx({
      address,
      contractIndex,
      fnName,
      arg,
      onTxSucceed: () => setIsLoading(false),
      onTxFailed: () => setIsLoading(false),
    });
  };

  const isArgValid = validateJson(arg) === null;

  const buttonText = useMemo(() => {
    if (!address) return 'Connect Wallet';
    return 'Execute';
  }, [address]);

  const isButtonDisabled = useMemo(() => {
    if (!address) return false;
    return !contractIndex || !fnName || !isArgValid;
  }, [address, contractIndex, fnName, isArgValid]);

  return (
    <Box
      display={show ? 'flex' : 'none'}
      maxWidth="560px"
      mx="auto"
      flexDirection="column"
      gap="20px"
    >
      <Text
        fontSize="24px"
        fontWeight="500"
        color="$blackAlpha600"
        textAlign="center"
      >
        Execute Contract
      </Text>
      <ContractIndexField
        indexValue={indexValue}
        onIndexInput={onIndexInput}
        onValidIndexChange={setContractIndex}
      />
      <InputField title="Function Name">
        <TextField
          id="fnName"
          value={fnName}
          onChange={(e) => setFnName(e.target.value)}
          autoComplete="off"
        />
        <InputField.Description>
          Provide the name of the function to call.
        </InputField.Description>
      </InputField>
      <InputField title="Argument">
        <JsonInput
          value={arg}
          setValue={setArg}
          minLines={INPUT_LINES}
          height="250px"
        />
      </InputField>
      <Button
        onClick={handleExecute}
        disabled={isButtonDisabled}
        isLoading={isLoading}
        width="100%"
        variant="primary"
      >
        {buttonText}
      </Button>
    </Box>
  );
};
