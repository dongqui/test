import { useReactiveVar } from '@apollo/client';
import { InputCP } from 'components/Input/InputCP';
import { storeRenderingData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { RenderingDataPropertyName } from 'types/RP';
import * as S from './CPListTreeStyles';

export interface CPListRowInputProps {
  rowKey: string;
  name: string;
  x?:
    | RenderingDataPropertyName.positionX
    | RenderingDataPropertyName.rotationX
    | RenderingDataPropertyName.scaleX
    | RenderingDataPropertyName.locationX
    | RenderingDataPropertyName.angleX;
  y?:
    | RenderingDataPropertyName.positionY
    | RenderingDataPropertyName.rotationY
    | RenderingDataPropertyName.scaleY
    | RenderingDataPropertyName.locationY
    | RenderingDataPropertyName.angleY;
  z?:
    | RenderingDataPropertyName.positionZ
    | RenderingDataPropertyName.rotationZ
    | RenderingDataPropertyName.scaleZ
    | RenderingDataPropertyName.locationZ
    | RenderingDataPropertyName.angleZ;
}

const CPListRowInputComponent: React.FC<CPListRowInputProps> = ({
  rowKey,
  name,
  x = RenderingDataPropertyName.positionX,
  y = RenderingDataPropertyName.positionY,
  z = RenderingDataPropertyName.positionZ,
}) => {
  const renderingData = useReactiveVar(storeRenderingData);
  const onChange = useCallback(
    (e) => {
      if (!_.isNaN(Number(e.target.value))) {
        const name = e.target.name;
        storeRenderingData({ ...renderingData, [name]: parseFloat(e.target.value) });
      }
    },
    [renderingData],
  );
  const onDragEnd = useCallback(
    ({ name, value }) => {
      storeRenderingData({ ...renderingData, [name]: value });
    },
    [renderingData],
  );
  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {name}
        <S.CPListRowInputsWrapper>
          <InputCP
            number={renderingData[x] as number}
            prefix="X"
            onChange={onChange}
            onDragEnd={onDragEnd}
            name={x}
          />
          <InputCP
            number={renderingData[y] as number}
            prefix="Y"
            onChange={onChange}
            onDragEnd={onDragEnd}
            name={y}
          />
          <InputCP
            number={renderingData[z] as number}
            prefix="Z"
            onChange={onChange}
            onDragEnd={onDragEnd}
            name={z}
          />
        </S.CPListRowInputsWrapper>
      </S.CPListRowInputWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowInput = React.memo(CPListRowInputComponent);
