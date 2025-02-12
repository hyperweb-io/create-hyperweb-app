import { useState } from 'react';
import { Box, Text } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';
import { AccessType } from '@interchainjs/react/cosmwasm/wasm/v1/types';

import { InputField } from '../common';
import { FileUploader } from './FileUploader';
import {
  Address,
  Permission,
  InstantiatePermissionRadio,
} from './InstantiatePermissionRadio';
import { Button } from '../../common';
import { useChainStore } from '@/contexts';
import { useDetectBreakpoints, useStoreCodeTx } from '@/hooks';

type UploadContractProps = {
  show: boolean;
  onSuccess?: (codeId: string) => void;
};

export const UploadContract = ({ show, onSuccess }: UploadContractProps) => {
  const [wasmFile, setWasmFile] = useState<File | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([{ value: '' }]);
  const [permission, setPermission] = useState<Permission>(
    AccessType.ACCESS_TYPE_EVERYBODY
  );

  const { selectedChain } = useChainStore();
  const { address } = useChain(selectedChain);
  const { storeCodeTx, isLoading } = useStoreCodeTx(selectedChain);

  const resetStates = () => {
    setWasmFile(null);
    setAddresses([{ value: '' }]);
    setPermission(AccessType.ACCESS_TYPE_EVERYBODY);
  };

  const handleUpload = () => {
    if (!address || !wasmFile) return;

    storeCodeTx({
      wasmFile,
      permission,
      addresses: addresses.map((addr) => addr.value),
      onTxSucceed(codeId) {
        onSuccess?.(codeId);
        resetStates();
      },
    });
  };

  const isAddressesValid =
    permission === AccessType.ACCESS_TYPE_ANY_OF_ADDRESSES
      ? addresses.every((addr) => addr.isValid)
      : true;

  const isButtonDisabled = !address || !wasmFile || !isAddressesValid;

  const { isMobile } = useDetectBreakpoints();

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
        Upload Contract
      </Text>
      <InputField title="Contract File" required>
        <FileUploader file={wasmFile} setFile={setWasmFile} type="wasm" />
      </InputField>
      <InputField title="Instantiate Permission" required>
        <InstantiatePermissionRadio
          direction={isMobile ? 'column' : 'row'}
          addresses={addresses}
          permission={permission}
          setAddresses={setAddresses}
          setPermission={setPermission}
        />
      </InputField>
      <Button
        variant="primary"
        disabled={isButtonDisabled}
        onClick={handleUpload}
        isLoading={isLoading}
        mx="auto"
      >
        Upload
      </Button>
    </Box>
  );
};
