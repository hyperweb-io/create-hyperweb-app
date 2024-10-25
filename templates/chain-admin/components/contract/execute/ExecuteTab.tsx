import { useIsHyperwebChain } from '@/hooks';
import { ExecuteJsContract } from './ExecuteJsContract';
import { ExecuteWasmContract } from './ExecuteWasmContract';

export type ExecuteTabProps = {
  show: boolean;
  addressValue: string;
  onAddressInput: (input: string) => void;
};

export const ExecuteTab = ({
  show,
  addressValue,
  onAddressInput,
}: ExecuteTabProps) => {
  const isHyperwebChain = useIsHyperwebChain();

  return isHyperwebChain ? (
    <ExecuteJsContract
      show={show}
      indexValue={addressValue}
      onIndexInput={onAddressInput}
    />
  ) : (
    <ExecuteWasmContract
      show={show}
      addressValue={addressValue}
      onAddressInput={onAddressInput}
    />
  );
};
