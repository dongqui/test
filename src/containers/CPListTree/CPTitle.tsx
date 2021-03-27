import { ArrowRightBIcon } from 'components/Icons/generated2/ArrowRightBIcon';
import _ from 'lodash';
import React from 'react';
import * as S from './CPListTreeStyles';

export interface CPTitleProps {
  title?: string;
}

const CPTitleComponent: React.FC<CPTitleProps> = ({ title = 'Properties' }) => {
  return (
    <S.CPTitleWrapper>
      {title}
      <div>
        <ArrowRightBIcon />
        <ArrowRightBIcon />
      </div>
    </S.CPTitleWrapper>
  );
};
export const CPTitle = React.memo(CPTitleComponent);
