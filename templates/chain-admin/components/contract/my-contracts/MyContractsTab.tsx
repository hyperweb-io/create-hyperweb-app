import { useState } from 'react';
import { Box } from '@interchain-ui/react';

import { Button } from '../../common';
import { PopoverSelect } from './PopoverSelect';
import { MyContractsTable } from './MyContractsTable';
import { useIsHyperwebChain } from '@/hooks';
import { DeployFromJS, CreateFromUpload, CreateFromCodeId } from '../deploy';

const ContentViews = {
  MY_CONTRACTS: 'my_contracts',
  CREATE_FROM_UPLOAD: 'create_from_upload',
  CREATE_FROM_CODE_ID: 'create_from_code_id',
  DEPLOY_FROM_JS: 'deploy_from_js',
} as const;

type ContentView = typeof ContentViews[keyof typeof ContentViews];

const contractCreationOptions = [
  { label: 'From Upload', value: ContentViews.CREATE_FROM_UPLOAD },
  { label: 'From Code ID', value: ContentViews.CREATE_FROM_CODE_ID },
];

type MyContractsTabProps = {
  show: boolean;
  switchTab: (addressValue: string, tabId: number) => void;
};

export const MyContractsTab = ({ show, switchTab }: MyContractsTabProps) => {
  const [contentView, setContentView] = useState<ContentView>(
    ContentViews.MY_CONTRACTS
  );

  const isHyperwebChain = useIsHyperwebChain();

  return (
    <Box display={show ? 'block' : 'none'}>
      <MyContractsTable
        title="My Contracts"
        show={contentView === ContentViews.MY_CONTRACTS}
        switchTab={switchTab}
        createContractTrigger={
          isHyperwebChain ? (
            <Button
              variant="primary"
              onClick={() => setContentView(ContentViews.DEPLOY_FROM_JS)}
            >
              Deploy Contract
            </Button>
          ) : (
            <PopoverSelect
              trigger={<Button variant="primary">Create Contract</Button>}
              options={contractCreationOptions}
              onOptionClick={(value) => setContentView(value as ContentView)}
              popoverWidth="152px"
            />
          )
        }
      />
      {contentView === ContentViews.CREATE_FROM_UPLOAD && (
        <CreateFromUpload
          switchTab={switchTab}
          onBack={() => setContentView(ContentViews.MY_CONTRACTS)}
        />
      )}
      {contentView === ContentViews.CREATE_FROM_CODE_ID && (
        <CreateFromCodeId
          switchTab={switchTab}
          onBack={() => setContentView(ContentViews.MY_CONTRACTS)}
        />
      )}
      {contentView === ContentViews.DEPLOY_FROM_JS && (
        <DeployFromJS
          switchTab={switchTab}
          onBack={() => setContentView(ContentViews.MY_CONTRACTS)}
        />
      )}
    </Box>
  );
};
