import { ArrowRightBIcon } from 'components/Icons/generated2/ArrowRightBIcon';
import _ from 'lodash';
import React from 'react';
import * as S from './CPListTreeStyles';

export interface CPTitleProps {}

const CPTitleComponent: React.FC<CPTitleProps> = ({}) => {
  return (
    <S.CPTitleWrapper>
      Properties
      <div>
        <ArrowRightBIcon />
        <ArrowRightBIcon />
      </div>
    </S.CPTitleWrapper>
  );
};
export const CPTitle = React.memo(CPTitleComponent);
