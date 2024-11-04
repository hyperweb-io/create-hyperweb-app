import { useIsHyperwebChain } from '@/hooks';
import { QueryWasmContract } from './QueryWasmContract';
import { QueryJsContract } from './QueryJsContract';

export type QueryTabProps = {
  show: boolean;
  addressValue: string;
  onAddressInput: (input: string) => void;
};

export const QueryTab = ({
  show,
  addressValue,
  onAddressInput,
}: QueryTabProps) => {
  const isHyperwebChain = useIsHyperwebChain();

  return isHyperwebChain ? (
    <QueryJsContract
      show={show}
      indexValue={addressValue}
      onIndexInput={onAddressInput}
    />
  ) : (
    <QueryWasmContract
      show={show}
      addressValue={addressValue}
      onAddressInput={onAddressInput}
    />
  );
};
