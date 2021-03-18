import { ArrowDownIcon } from 'components/Icons/generated2/ArrowDownIcon';
import _ from 'lodash';
import React from 'react';
import * as S from './CPListTreeStyles';

export interface CPListRowParentProps {
  text: string;
}

const CPListRowParentComponent: React.FC<CPListRowParentProps> = ({ text = 'Transform' }) => {
  return (
    <S.CPListRowParentWrapper>
      <ArrowDownIcon style={{ cursor: 'pointer' }} />
      <S.CPListRowParentTextWrapper>{text}</S.CPListRowParentTextWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowParent = React.memo(CPListRowParentComponent);
