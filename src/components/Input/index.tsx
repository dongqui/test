import styled from '@emotion/styled';
import React from 'react';
import classNames from 'classnames';
import styles from './Input.module.scss';
import { SizeType, UnionType, Omit } from '../utils/types';

const cx = classNames.bind(styles);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'type'> {
  size?: SizeType;
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
  maxLength?: number;
  min?: number;
  max?: number;
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

interface InputStyleProps {
  size?: SizeType;
}

const InputWrap = styled.div<InputStyleProps>`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  width: 2.5rem;
  height: 1.25rem;
  background-color: var(--gray400);
  border-radius: 4px;
  margin-right: 0.5rem;
`;

export const Input: React.FC<InputProps> = ({
  size,
  cursor,
  type,
  id,
  key,
  prefix = 'X',
  maxLength,
  min,
  max,
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
    <InputWrap size={size}>
      <div className={styles.prefixText}>{prefix}</div>
      <input
        className={styles.Input}
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
