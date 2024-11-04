import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Combobox,
  ComboboxProps,
  Icon,
  Spinner,
  Text,
  TextProps,
} from '@interchain-ui/react';

import { InputField } from './InputField';

export type InputStatus = {
  state: 'init' | 'loading' | 'success' | 'error';
  message?: string;
};

type StatusDisplay = {
  icon?: React.ReactNode;
  text?: string;
  textColor?: TextProps['color'];
};

const displayStatus = (status: InputStatus, fieldName: string) => {
  const statusMap: Record<InputStatus['state'], StatusDisplay> = {
    loading: {
      icon: <Spinner size="$lg" color="$textSecondary" />,
      text: `Checking ${fieldName}...`,
      textColor: '$textSecondary',
    },

    success: {
      icon: <Icon name="checkboxCircle" size="18px" color="$textSuccess" />,
      text: `Valid ${fieldName}`,
      textColor: '$text',
    },

    error: {
      icon: <Icon name="errorWarningLine" size="18px" color="$textDanger" />,
      text: status.message || `Invalid ${fieldName}`,
      textColor: '$textDanger',
    },

    init: {},
  };

  return statusMap[status.state];
};

type ComboboxFieldProps<T> = {
  label: string;
  status: InputStatus;
  items: T[];
  renderItem: (item: T) => {
    itemValue: string;
    content: React.ReactNode;
  };
  width?: string;
} & Pick<
  ComboboxProps<T>,
  'inputValue' | 'onInputChange' | 'onSelectionChange'
>;

export const ComboboxField = <T,>({
  inputValue,
  onInputChange,
  onSelectionChange,
  items,
  renderItem,
  label,
  status,
  width = '560px',
}: ComboboxFieldProps<T>) => {
  const [fieldWidth, setFieldWidth] = useState(width);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      const newWidth = containerRef.current?.clientWidth;
      if (newWidth) {
        setFieldWidth(`${newWidth}px`);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  const { icon, text, textColor } = displayStatus(status, label.toLowerCase());

  return (
    <Box width="100%" ref={containerRef}>
      <InputField title={label}>
        <Combobox
          openOnFocus
          allowsCustomValue
          inputValue={inputValue}
          onInputChange={onInputChange}
          onSelectionChange={onSelectionChange}
          styleProps={{ width: fieldWidth }}
        >
          {items.map((item) => {
            const { itemValue, content } = renderItem(item);
            return (
              <Combobox.Item key={itemValue} textValue={itemValue}>
                <Box transform="translateY(2px)">{content}</Box>
              </Combobox.Item>
            );
          })}
        </Combobox>
        {status.state !== 'init' && (
          <Box display="flex" alignItems="center" gap="6px">
            {icon}
            <Text color={textColor} fontSize="12px">
              {text}
            </Text>
          </Box>
        )}
      </InputField>
    </Box>
  );
};
