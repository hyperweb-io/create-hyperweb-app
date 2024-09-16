import { useState } from 'react';
import { Box } from '@interchain-ui/react';

import { Button } from '../common';
import { PopoverSelect } from './PopoverSelect';
import { MyContractsTable } from './MyContractsTable';
import { CreateFromUpload } from './CreateFromUpload';
import { CreateFromCodeId } from './CreateFromCodeId';

const ContentViews = {
  MY_CONTRACTS: 'my_contracts',
  CREATE_FROM_UPLOAD: 'create_from_upload',
  CREATE_FROM_CODE_ID: 'create_from_code_id',
} as const;

type ContentView = (typeof ContentViews)[keyof typeof ContentViews];

const createContractOptions = [
  { label: 'From Upload', value: ContentViews.CREATE_FROM_UPLOAD },
  { label: 'From Code ID', value: ContentViews.CREATE_FROM_CODE_ID },
];

type MyContractsTabProps = {
  show: boolean;
  switchTab: (initialAddress: string, tabId: number) => void;
};

export const MyContractsTab = ({ show, switchTab }: MyContractsTabProps) => {
  const [contentView, setContentView] = useState<ContentView>(
    ContentViews.MY_CONTRACTS,
  );

  return (
    <Box display={show ? 'block' : 'none'}>
      <MyContractsTable
        title="My contracts"
        show={contentView === ContentViews.MY_CONTRACTS}
        switchTab={switchTab}
        createContractTrigger={
          <PopoverSelect
            trigger={<Button variant="primary">Create New Contract</Button>}
            options={createContractOptions}
            onOptionClick={(value) => setContentView(value as ContentView)}
          />
        }
      />
      {contentView === ContentViews.CREATE_FROM_UPLOAD && (
        <CreateFromUpload
          onBack={() => setContentView(ContentViews.MY_CONTRACTS)}
        />
      )}
      {contentView === ContentViews.CREATE_FROM_CODE_ID && (
        <CreateFromCodeId
          onBack={() => setContentView(ContentViews.MY_CONTRACTS)}
        />
      )}
    </Box>
  );
};
