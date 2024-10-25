import { useMemo, useRef, useState } from 'react';
import { Box, Text, TextField } from '@interchain-ui/react';

import {
  InputField,
  JsonInput,
  JsonEditor,
  ContractIndexField,
} from '../common';
import { Button } from '../../common';
import { useQueryJsContract } from '@/hooks';
import { countJsonLines, validateJson } from '@/utils';

const INPUT_LINES = 12;
const OUTPUT_LINES = 12;

type QueryJsContractProps = {
  show: boolean;
  indexValue: string;
  onIndexInput: (input: string) => void;
};

export const QueryJsContract = ({
  show,
  indexValue,
  onIndexInput,
}: QueryJsContractProps) => {
  const [contractIndex, setContractIndex] = useState('');
  const [fnName, setFnName] = useState('');
  const [arg, setArg] = useState('');

  const {
    data: queryResult,
    refetch: queryJsContract,
    error: queryJsContractError,
    isFetching,
  } = useQueryJsContract({
    contractIndex,
    fnName,
    arg,
    enabled: false,
  });

  const prevResultRef = useRef('');

  const res = useMemo(() => {
    if (isFetching) {
      return prevResultRef.current;
    } else {
      const newResult = queryResult
        ? JSON.stringify(queryResult, null, 2)
        : queryJsContractError
        ? (queryJsContractError as Error)?.message || 'Unknown error'
        : '';

      prevResultRef.current = newResult;

      return newResult;
    }
  }, [isFetching]);

  const isJsonValid = useMemo(() => {
    return validateJson(res) === null || res.length === 0;
  }, [res]);

  const lines = useMemo(() => {
    return Math.max(OUTPUT_LINES, countJsonLines(res));
  }, [res]);

  const isArgValid = validateJson(arg) === null || arg.length === 0;

  const isQueryButtonDisabled = !contractIndex || !fnName || !isArgValid;

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
        Query Contract
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
      <InputField title="Argument (optional)">
        <JsonInput
          value={arg}
          setValue={setArg}
          minLines={INPUT_LINES}
          height="250px"
        />
      </InputField>
      <Button
        disabled={isQueryButtonDisabled}
        onClick={queryJsContract}
        isLoading={isFetching}
        width="100%"
        variant="primary"
      >
        Query
      </Button>
      <InputField title="Return Output">
        <Box
          borderWidth="1px"
          borderStyle="solid"
          borderColor={isJsonValid ? '$blackAlpha300' : '$red600'}
          borderRadius="4px"
          height="250px"
          overflowY="auto"
          p="10px"
        >
          <JsonEditor
            value={res}
            lines={lines}
            isValid={isJsonValid}
            readOnly
          />
        </Box>
      </InputField>
    </Box>
  );
};
