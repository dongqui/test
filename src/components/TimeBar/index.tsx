import { TimeBarIcon } from 'components/Icons/generated2/TimeBarIcon';
import _ from 'lodash';
import React, { useCallback, useState } from 'react';
import * as S from './TimeBarStyles';

export interface TimeBarProps {}

const TimeBarComponent: React.FC<TimeBarProps> = ({}) => {
  return (
    <S.BarWrapper>
      <TimeBarIcon style={{ position: 'absolute', top: 0, zIndex: 100 }} />
      <S.Bar />
    </S.BarWrapper>
  );
};
export const TimeBar = React.memo(TimeBarComponent);
