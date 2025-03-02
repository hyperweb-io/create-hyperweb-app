import { Box } from '@interchain-ui/react';

import { BackButton } from '../common';
import { useDetectBreakpoints } from '@/hooks';
import { DeployJsContract } from './DeployJsContract';

type DeployFromJSProps = {
  onBack: () => void;
  switchTab: (addressValue: string, tabId: number) => void;
};

export const DeployFromJS = ({ onBack, switchTab }: DeployFromJSProps) => {
  const { isTablet } = useDetectBreakpoints();

  return (
    <Box position="relative">
      <Box position={isTablet ? 'relative' : 'absolute'} top="0" left="0">
        <BackButton onClick={onBack} />
      </Box>
      <Box mt={isTablet ? '40px' : '0'}>
        <DeployJsContract switchTab={switchTab} onViewMyContracts={onBack} />
      </Box>
    </Box>
  );
};
