import _ from 'lodash';
import React from 'react';
import { rem } from 'utils/rem';
import { GRAY300 } from '../../styles/constants/common';
import * as S from './inputStyles';

export interface InputDefaultProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  borderRadius?: number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void | undefined;
}

const InputDeafultComponent: React.FC<InputDefaultProps> = ({
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
      <S.InputDefault borderRadius={borderRadius} placeholder={placeholder} onChange={onChange} />
    </S.InputLPWrapper>
  );
};

export const InputDefault = React.memo(InputDeafultComponent);
