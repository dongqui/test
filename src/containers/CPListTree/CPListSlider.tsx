import { useReactiveVar } from '@apollo/client';
import { storeRenderingData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import * as S from './CPListTreeStyles';

const MIN = 0;
const MAX = 100;
export interface CPListRowSliderProps {
  rowKey: string;
  name: string;
  // slider?: RenderingDataPropertyName.fogNear | RenderingDataPropertyName.fogFar;
}
const CPListRowSliderComponent: React.FC<CPListRowSliderProps> = ({
  rowKey,
  name,
  // slider = RenderingDataPropertyName.fogNear,
}) => {
  const renderingData = useReactiveVar(storeRenderingData);
  // const value = useMemo(() => renderingData[slider], [renderingData, slider]);
  const onChange = useCallback(
    (e) => {
      storeRenderingData({
        ...renderingData,
        // [slider]: e.target.valueAsNumber,
      });
    },
    [renderingData],
  );
  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {name}
        <S.CPListRowInputsWrapper>
          {/* <S.SliderIndicator left={Math.round(((value as any) / MAX) * 100) - 6}>
            {value}
          </S.SliderIndicator> */}
          <S.CPListRowSliderWrapper
            min={MIN}
            max={MAX}
            // value={value as any}
            onChange={onChange}
          ></S.CPListRowSliderWrapper>
        </S.CPListRowInputsWrapper>
      </S.CPListRowInputWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowSlider = React.memo(CPListRowSliderComponent);
