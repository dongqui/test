import _ from 'lodash';
import React from 'react';
import * as S from './ProgressiveBarStyles';

export interface ProgressiveBarProps {
  totalTime: number;
  isActive: boolean;
}

const ProgressiveBarComponent: React.FC<ProgressiveBarProps> = ({
  totalTime = 10,
  isActive = false,
}) => {
  return (
    <S.ProgressiveBarWrapper>
      <S.ProgressiveBarChildWrapper
        isActive={isActive}
        totalTime={totalTime}
      ></S.ProgressiveBarChildWrapper>
    </S.ProgressiveBarWrapper>
  );
};
export const ProgressiveBar = React.memo(ProgressiveBarComponent);
