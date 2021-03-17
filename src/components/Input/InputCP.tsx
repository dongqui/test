import React from 'react';
import * as S from './inputStyles';

export interface InputCPProps {
  prefix?: 'X' | 'Y' | 'Z';
}
export const Input: React.FC<InputCPProps> = ({ prefix = 'X' }) => {
  return (
    <S.InputCPWrapper>
      <S.PrefixWrapper>{prefix}</S.PrefixWrapper>
      <S.InputCPInput></S.InputCPInput>
    </S.InputCPWrapper>
  );
};
