import { useEffect, useRef, useState } from 'react';
import { Text } from '@interchain-ui/react';

import { useJsContractInfo, useMyContracts } from '@/hooks';
import { validateContractIndex } from '@/utils';
import { ComboboxField, InputStatus } from './ComboboxField';

type ContractIndexFieldProps = {
  indexValue?: string;
  onIndexInput?: (input: string) => void;
  onValidIndexChange?: (index: string) => void;
};

export const ContractIndexField = ({
  indexValue,
  onIndexInput,
  onValidIndexChange,
}: ContractIndexFieldProps) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<InputStatus>({ state: 'init' });

  const prevInputRef = useRef<string>('');

  const { refetch: fetchJsContractInfo } = useJsContractInfo({
    contractIndex: input,
    enabled: false,
  });
  const { data: myContracts } = useMyContracts();

  useEffect(() => {
    if (!indexValue || prevInputRef.current === indexValue) return;
    setInput(indexValue);
    onIndexInput?.(indexValue);
  }, [indexValue]);

  useEffect(() => {
    if (prevInputRef.current === input) return;

    prevInputRef.current = input;

    setStatus({ state: 'init' });
    onValidIndexChange?.('');

    if (input.length) {
      const error = validateContractIndex(input);

      if (error) {
        return setStatus({ state: 'error', message: error });
      }

      setStatus({ state: 'loading' });

      const timer = setTimeout(() => {
        fetchJsContractInfo().then(({ data }) => {
          if (!data) {
            return setStatus({
              state: 'error',
              message: 'This contract does not exist',
            });
          }

          setStatus({ state: 'success' });
          onValidIndexChange?.(input);
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [input, fetchJsContractInfo]);

  return (
    <ComboboxField
      label="Contract Index"
      status={status}
      inputValue={input}
      onInputChange={(input) => {
        setInput(input);
        onIndexInput?.(input);
      }}
      onSelectionChange={(value) => {
        if (value) {
          setInput(value as string);
          onIndexInput?.(value as string);
        }
      }}
      items={myContracts?.jsdContracts || []}
      renderItem={({ index }) => ({
        itemValue: index.toString(),
        content: <Text>{index.toString()}</Text>,
      })}
    />
  );
};
