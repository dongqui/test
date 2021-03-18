import React from 'react';
import * as S from './InputStyles';

export interface InputCPProps {
  prefix?: 'X' | 'Y' | 'Z';
  number: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined;
}
export const InputCP: React.FC<InputCPProps> = ({ prefix = 'X', onChange = () => {}, number }) => {
  return (
    <S.InputCPWrapper>
      <S.PrefixWrapper>{prefix}</S.PrefixWrapper>
      <S.InputCPInput onChange={onChange} value={number}></S.InputCPInput>
    </S.InputCPWrapper>
  );
};
