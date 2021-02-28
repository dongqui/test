import _ from 'lodash';
import React from 'react';
import { rem } from 'utils';
import * as S from './PlayBarStyles';

export interface IndicatorProps {
  now: number;
  start: number;
  end: number;
}

const IndicatorComponent: React.FC<IndicatorProps> = ({ now = 100, start = 100, end = 300 }) => {
  return (
    <S.IndicatorWrapper>
      <S.IndicatorText>Now</S.IndicatorText>
      <S.IndicatorNumberWrapper>{now}</S.IndicatorNumberWrapper>
      <S.IndicatorBar></S.IndicatorBar>
      <S.IndicatorText marginLeft={rem(16)}>Start</S.IndicatorText>
      <S.IndicatorNumberWrapper>{start}</S.IndicatorNumberWrapper>
      <S.IndicatorText marginLeft={rem(12)}>End</S.IndicatorText>
      <S.IndicatorNumberWrapper>{end}</S.IndicatorNumberWrapper>
    </S.IndicatorWrapper>
  );
};
export const Indicator = React.memo(IndicatorComponent);
