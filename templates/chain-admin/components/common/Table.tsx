import { useState } from 'react';
import {
  Box,
  BoxProps,
  useColorModeValue,
  Icon,
  Text,
} from '@interchain-ui/react';
import { useCopyToClipboard } from '@/hooks';

const Table = (props: BoxProps) => {
  return <Box as="table" rawCSS={{ borderSpacing: '0 20px' }} {...props} />;
};

const TableHeader = (props: BoxProps) => {
  return <Box as="thead" {...props} />;
};

const TableBody = (props: BoxProps) => {
  return <Box as="tbody" {...props} />;
};

const TableRow = ({
  hasHover = false,
  ...props
}: BoxProps & { hasHover?: boolean }) => {
  const bgHoverColor = useColorModeValue('$blackAlpha100', '$whiteAlpha100');

  return (
    <Box
      as="tr"
      height="38px"
      cursor={hasHover ? 'pointer' : undefined}
      backgroundColor={{
        base: 'transparent',
        hover: hasHover ? bgHoverColor : 'transparent',
      }}
      {...props}
    />
  );
};

const TableHeaderCell = (props: BoxProps) => {
  return (
    <Box
      as="th"
      textAlign="left"
      color="$blackAlpha500"
      fontSize="14px"
      fontWeight="400"
      {...props}
    />
  );
};

interface TableCellProps extends BoxProps {
  copyOnHover?: boolean;
  copyValue?: string;
}

const TableCell = ({
  copyOnHover = false,
  copyValue,
  children,
  ...props
}: TableCellProps) => {
  const [isHover, setIsHover] = useState(false);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const handleCopy = () => {
    if (copyValue) {
      copyToClipboard(copyValue);
    }
  };

  const content = copyOnHover ? (
    <Box
      display="flex"
      alignItems="center"
      gap="8px"
      width="$fit"
      cursor="pointer"
      attributes={{
        onMouseEnter: () => setIsHover(true),
        onMouseLeave: () => setIsHover(false),
        onClick: handleCopy,
      }}
    >
      <Text color="inherit" fontSize="inherit" fontWeight="inherit">
        {children}
      </Text>
      {isHover && (
        <Box display="flex" transform="translateY(2px)">
          <Icon
            name={isCopied ? 'checkLine' : 'copy'}
            color={isCopied ? '$green600' : '$blackAlpha500'}
            size="$md"
          />
        </Box>
      )}
    </Box>
  ) : (
    children
  );

  return (
    <Box
      as="td"
      color="$blackAlpha600"
      fontSize="14px"
      fontWeight="600"
      {...props}
    >
      {content}
    </Box>
  );
};

Table.Header = TableHeader;
Table.HeaderCell = TableHeaderCell;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export { Table };
