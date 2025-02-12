import { useEffect, useRef, useState } from 'react';
import { useChain } from '@interchain-kit/react';
import { Text } from '@interchain-ui/react';

import { useContractInfo, useDetectBreakpoints, useMyContracts } from '@/hooks';
import { shortenAddress, validateContractAddress } from '@/utils';
import { useChainStore } from '@/contexts';
import { ComboboxField, InputStatus } from './ComboboxField';

type ContractAddressFieldProps = {
  addressValue?: string;
  onAddressInput?: (input: string) => void;
  onValidAddressChange?: (address: string) => void;
};

export const ContractAddressField = ({
  addressValue,
  onAddressInput,
  onValidAddressChange,
}: ContractAddressFieldProps) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<InputStatus>({ state: 'init' });

  const prevInputRef = useRef<string>('');

  const { selectedChain } = useChainStore();
  const { chain } = useChain(selectedChain);
  const { refetch: fetchContractInfo } = useContractInfo({
    contractAddress: input,
    enabled: false,
  });
  const { data: myContracts } = useMyContracts();

  useEffect(() => {
    if (!addressValue || prevInputRef.current === addressValue) return;
    setInput(addressValue);
    onAddressInput?.(addressValue);
  }, [addressValue]);

  useEffect(() => {
    if (prevInputRef.current === input) return;

    prevInputRef.current = input;

    setStatus({ state: 'init' });
    onValidAddressChange?.('');

    if (input.length) {
      const error = validateContractAddress(input, chain.bech32Prefix ?? '');

      if (error) {
        return setStatus({ state: 'error', message: error });
      }

      setStatus({ state: 'loading' });

      const timer = setTimeout(() => {
        fetchContractInfo().then(({ data }) => {
          if (!data) {
            return setStatus({
              state: 'error',
              message: 'This contract does not exist',
            });
          }

          setStatus({ state: 'success' });
          onValidAddressChange?.(input);
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [input, fetchContractInfo, chain.bech32Prefix]);

  const { isMobile } = useDetectBreakpoints();

  return (
    <ComboboxField
      label="Contract Address"
      status={status}
      inputValue={input}
      onInputChange={(input) => {
        setInput(input);
        onAddressInput?.(input);
      }}
      onSelectionChange={(value) => {
        if (value) {
          setInput(value as string);
          onAddressInput?.(value as string);
        }
      }}
      items={myContracts?.wasmContracts || []}
      renderItem={({ address, contractInfo }) => ({
        itemValue: address,
        content: (
          <Text>
            {`${shortenAddress(address, isMobile ? 8 : 18)} (`}
            <Text as="span" fontWeight="600">
              {`${contractInfo?.label || 'Unnamed'}`}
            </Text>
            {')'}
          </Text>
        ),
      })}
    />
  );
};
