import _ from 'lodash';
import React from 'react';
import { rem } from 'utils';
import { GRAY300, GRAY500 } from '../../styles/common';
import { Search } from '../Icons/generated/Search';
import * as S from './inputStyles';

export interface InputLPProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
  icon?: React.ReactNode;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined;
}

const IconLPComponent: React.FC<InputLPProps> = ({
  width = rem(206),
  height = rem(32),
  backgroundColor = GRAY300,
  borderRadius = 0.4,
  placeholder = 'Search Projects',
  onChange = () => {},
}) => {
  return (
    <S.InputLPWrapper
      width={width}
      height={height}
      backgroundColor={backgroundColor}
      borderRadius={borderRadius}
    >
      <S.IconWrapper>
        <S.SearchIcon />
      </S.IconWrapper>
      <S.InputLP borderRadius={borderRadius} placeholder={placeholder} onChange={onChange} />
    </S.InputLPWrapper>
  );
};
/**
 * LP TP에 쓸 인풋으로 따로 하나 만들었음
 */
export const InputLP = React.memo(IconLPComponent);
