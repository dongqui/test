import styled from '@emotion/styled';
import React from 'react';
import styles from './Input.module.scss';
import { UnionType, Omit } from '../utils/types';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'type'> {
  cursor?: UnionType<
    | 'auto'
    | 'crosshair'
    | 'default'
    | 'pointer'
    | 'move'
    | 'e-resize'
    | 'ne-resize'
    | 'nw-resize'
    | 'n-resize'
    | 'se-resize'
    | 'sw-resize'
    | 's-resize'
    | 'w-resize'
    | 'text'
    | 'wait'
    | 'help',
    string
  >;
  type?: UnionType<
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week',
    string
  >;
  id: string;
  key: string | number;
  prefix?: React.ReactNode | string;
  isPrefix?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  fontSize?: number;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  value: string | number | readonly string[] | undefined;
  defaultValue: string | number | readonly string[] | undefined;
  ref?: (
    instance: HTMLInputElement | null,
  ) => void | React.RefObject<HTMLInputElement> | null | undefined;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined;
}

export interface InputWrapperProps {
  width?: string;
  height?: string;
  backgroundColor?: string;
  borderRadius?: number;
}
export interface InputChildProps {
  fontSize: number;
}

const InputWrap = styled.div<InputWrapperProps>`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: ${(props) => props.backgroundColor};
  border-radius: ${(props) => props.borderRadius}px;
  margin-right: 0.5rem;
`;
const InputChild = styled.input<InputChildProps>`
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: ${(props) => props.fontSize}rem;
  font-weight: normal;
  text-align: left;
  color: var(--gray700);

  ::placeholder {
    color: var(--gray600);
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    appearance: none;
  }
`;

export const Input: React.FC<InputProps & InputWrapperProps & InputChildProps> = ({
  // Box
  width = '2.5rem',
  height = '1.25rem',
  backgroundColor = `var(--gray400)`,
  borderRadius = 4,
  // Input
  type = 'text',
  id,
  key,
  prefix = 'X',
  isPrefix = true,
  maxLength,
  min,
  max,
  fontSize = 1,
  disabled,
  readOnly,
  placeholder,
  value,
  defaultValue,
  ref,
  onKeyPress,
  onChange,
}) => {
  return (
    <InputWrap
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
    >
      {isPrefix && <div className={styles.prefixText}>{prefix}</div>}
      <InputChild
        fontSize={fontSize}
        ref={ref}
        type={type}
        id={id}
        key={key}
        maxLength={maxLength}
        min={min}
        max={max}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onKeyPress={onKeyPress}
        onChange={onChange}
      />
    </InputWrap>
  );
};
