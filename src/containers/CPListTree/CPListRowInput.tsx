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
  const onDragEnd = useCallback(
    ({ name, value }) => {
      storeRenderingData({ ...renderingData, [name]: value });
    },
    [renderingData],
  );
  const handleBlur = useCallback(
    ({ name, value }) => {
      storeRenderingData({ ...renderingData, [name]: value });
    },
    [renderingData],
  );
  const onKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (_.isEqual(e.key, 'Enter')) {
      e.currentTarget.blur();
    }
  }, []);
  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {name}
        <S.CPListRowInputsWrapper>
          <InputCP
            number={renderingData[x] as number}
            prefix="X"
            onDragEnd={onDragEnd}
            handleBlur={handleBlur}
            onKeyPress={onKeyPress}
            name={x}
          />
          <InputCP
            number={renderingData[y] as number}
            prefix="Y"
            onDragEnd={onDragEnd}
            handleBlur={handleBlur}
            onKeyPress={onKeyPress}
            name={y}
          />
          <InputCP
            number={renderingData[z] as number}
            prefix="Z"
            onDragEnd={onDragEnd}
            handleBlur={handleBlur}
            onKeyPress={onKeyPress}
            name={z}
          />
        </S.CPListRowInputsWrapper>
      </S.CPListRowInputWrapper>
    </S.CPListRowParentWrapper>
  );
};
export const CPListRowInput = React.memo(CPListRowInputComponent);
