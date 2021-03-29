import { useReactiveVar } from '@apollo/client';
import { InputCP } from 'components/Input/InputCP';
import { storeRenderingData, storeCurrentBone, storeTransformControls } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { RenderingDataPropertyName } from 'types/RP';
import {
  fnChangeBonePosition,
  fnChangeBoneRotation,
  fnChangeBoneScale,
} from 'utils/CP/transformUtils';
import * as S from './CPListTreeStyles';
import * as THREE from 'three';

export interface CPListRowInputProps {
  rowKey: string;
  name: string;
  x?:
    | RenderingDataPropertyName.positionX
    | RenderingDataPropertyName.rotationX
    | RenderingDataPropertyName.scaleX;
  // | RenderingDataPropertyName.locationX
  // | RenderingDataPropertyName.angleX;
  y?:
    | RenderingDataPropertyName.positionY
    | RenderingDataPropertyName.rotationY
    | RenderingDataPropertyName.scaleY;
  // | RenderingDataPropertyName.locationY
  // | RenderingDataPropertyName.angleY;
  z?:
    | RenderingDataPropertyName.positionZ
    | RenderingDataPropertyName.rotationZ
    | RenderingDataPropertyName.scaleZ;
  // | RenderingDataPropertyName.locationZ
  // | RenderingDataPropertyName.angleZ;
}

const CPListRowInputComponent: React.FC<CPListRowInputProps> = ({
  rowKey,
  name,
  x = RenderingDataPropertyName.positionX,
  y = RenderingDataPropertyName.positionY,
  z = RenderingDataPropertyName.positionZ,
}) => {
  const renderingData = useReactiveVar(storeRenderingData);
  const currentBone = useReactiveVar(storeCurrentBone);
  const transformControls = useReactiveVar(storeTransformControls);

  const onDragEnd = useCallback(
    ({ name, value }) => {
      const property = name.slice(0, -1);
      const axis = name.slice(-1).toLowerCase();
      switch (property) {
        case 'position':
          if (currentBone) {
            fnChangeBonePosition({ targetBone: currentBone, axis, value });
          }
          break;
        case 'rotation':
          if (currentBone) {
            fnChangeBoneRotation({ targetBone: currentBone, axis, value });
          }
          break;
        case 'scale':
          if (currentBone) {
            fnChangeBoneScale({ targetBone: currentBone, axis, value });
          }
          break;
      }
    },
    [currentBone],
  );

  const handleBlur = useCallback(
    ({ name, value }) => {
      const property = name.slice(0, -1);
      const axis = name.slice(-1).toLowerCase();
      switch (property) {
        case 'position':
          if (currentBone) {
            fnChangeBonePosition({ targetBone: currentBone, axis, value });
          }
          break;
        case 'rotation':
          if (currentBone) {
            fnChangeBoneRotation({ targetBone: currentBone, axis, value });
          }
          break;
        case 'scale':
          if (currentBone) {
            fnChangeBoneScale({ targetBone: currentBone, axis, value });
          }
          break;
      }
    },
    [currentBone],
  );

  const onKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (_.isEqual(e.key, 'Enter')) {
      e.currentTarget.blur();
    }
  }, []);

  const initialValue = {
    x: 0,
    y: 0,
    z: 0,
  };

  switch (x.slice(0, -1)) {
    case 'position':
      if (currentBone) {
        initialValue.x = currentBone.position.x;
      }
      break;
    case 'rotation':
      if (currentBone) {
        initialValue.x = currentBone.rotation.x;
      }
      break;
    case 'scale':
      if (currentBone) {
        initialValue.x = currentBone.scale.x;
      }
      break;
  }

  switch (y.slice(0, -1)) {
    case 'position':
      if (currentBone) {
        initialValue.y = currentBone.position.y;
      }
      break;
    case 'rotation':
      if (currentBone) {
        initialValue.y = currentBone.rotation.y;
      }
      break;
    case 'scale':
      if (currentBone) {
        initialValue.y = currentBone.scale.y;
      }
      break;
  }

  switch (z.slice(0, -1)) {
    case 'position':
      if (currentBone) {
        initialValue.z = currentBone.position.z;
      }
      break;
    case 'rotation':
      if (currentBone) {
        initialValue.z = currentBone.rotation.z;
      }
      break;
    case 'scale':
      if (currentBone) {
        initialValue.z = currentBone.scale.z;
      }
      break;
  }

  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {name}
        <S.CPListRowInputsWrapper>
          <InputCP
            initialValue={initialValue.x}
            prefix="X"
            onDragEnd={onDragEnd}
            handleBlur={handleBlur}
            onKeyPress={onKeyPress}
            name={x}
          />
          <InputCP
            initialValue={initialValue.y}
            prefix="Y"
            onDragEnd={onDragEnd}
            handleBlur={handleBlur}
            onKeyPress={onKeyPress}
            name={y}
          />
          <InputCP
            initialValue={initialValue.z}
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
