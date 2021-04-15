import React, { FunctionComponent } from 'react';
import { PrefixInput } from 'components/New_Input';

interface Props {
  key: string;
  innerRef: React.RefObject<HTMLInputElement> | undefined;
  value: number;
  prefix: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  onKeyPress: React.KeyboardEventHandler<HTMLInputElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
}

export const CPInput: FunctionComponent<Props> = ({
  key,
  innerRef,
  value,
  prefix,
  name,
  onChange,
  onBlur,
  onKeyPress,
  onKeyDown,
}) => {
  return (
    <PrefixInput
      key={key}
      innerRef={innerRef}
      value={value}
      prefix={prefix}
      name={name}
      onChange={onChange}
      onBlur={onBlur}
      onKeyPress={onKeyPress}
      onKeyDown={onKeyDown}
    />
  );
};
