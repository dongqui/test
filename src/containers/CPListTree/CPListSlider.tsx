import { useReactiveVar } from '@apollo/client';
import { CPDataPropertyNames } from 'types/CP';
import { storeCPData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import * as S from './CPListTreeStyles';

export interface CPListRowSliderProps {
  rowKey: string;
  text: string;
  min?: number;
  max?: number;
  value?: number;
}

const CPListRowSliderComponent: React.FC<CPListRowSliderProps> = ({
  rowKey,
  text = 'Near',
  min = 0,
  max = 100,
}) => {
  const cpData = useReactiveVar(storeCPData);
  const value: number = useMemo(
    () => _.find(cpData, [CPDataPropertyNames.key, rowKey])?.value ?? 0,
    [cpData, rowKey],
  );
  const onChange = useCallback(
    (e) => {
      storeCPData(
        _.map(cpData, (item) => ({
          ...item,
          value: _.isEqual(item.key, rowKey) ? e.target.valueAsNumber : item?.value,
        })),
      );
    },
    [cpData, rowKey],
  );
  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {text}
        <S.CPListRowInputsWrapper>
          <S.SliderIndicator left={Math.round((value / max) * 100) - 6}>{value}</S.SliderIndicator>
          <S.CPListRowSliderWrapper
            min={min}
            max={max}
            value={value}
            onChange={onChange}
          ></S.CPListRowSliderWrapper>
        </S.CPListRowInputsWrapper>
      </S.CPListRowInputWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowSlider = React.memo(CPListRowSliderComponent);
