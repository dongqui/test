import React from 'react';
import * as S from './StyleInput';

export interface InputCPProps {
  prefix?: 'X' | 'Y' | 'Z';
  number: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined;
  name?: string;
}
export const InputCP: React.FC<InputCPProps> = ({
  prefix = 'X',
  onChange = () => {},
  number,
  name = '',
}) => {
  return (
    <S.InputCPWrapper>
      <S.PrefixWrapper>{prefix}</S.PrefixWrapper>
      <S.InputCPInput onChange={onChange} value={number} name={name}></S.InputCPInput>
    </S.InputCPWrapper>
  );
};
