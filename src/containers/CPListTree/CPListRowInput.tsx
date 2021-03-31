import { useReactiveVar } from '@apollo/client';
import { InputCP } from 'components/Input/InputCP';
import { storeRenderingData, storeCurrentBone, storeTransformControls } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { CPNameType } from 'types/CP';
import { RenderingDataPropertyName } from 'types/RP';
import {
  fnChangeBonePosition,
  fnChangeBoneRotation,
  fnChangeBoneScale,
} from 'utils/CP/transformUtils';
import * as S from './CPListTreeStyles';

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
  const currentBone = useReactiveVar(storeCurrentBone);
  const transformControls = useReactiveVar(storeTransformControls);
  const [initialValue, setInitialValue] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const onDragMove = useCallback(
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

  useEffect(() => {
    if (transformControls) {
      transformControls.addEventListener('objectChange', (event) => {
        // event.target 이 transformControls,
        // event.target.object 가 컨트롤 한 Bone 입니다
        const targetObject = event.target.object;
        if (_.isEqual(name, CPNameType.Position)) {
          setInitialValue({
            x: targetObject?.position?.x ?? 0,
            y: targetObject?.position?.y ?? 0,
            z: targetObject?.position?.z ?? 0,
          });
        }
        if (_.isEqual(name, CPNameType.Rotation)) {
          setInitialValue({
            x: targetObject?.rotation?.x ?? 0,
            y: targetObject?.rotation?.y ?? 0,
            z: targetObject?.rotation?.z ?? 0,
          });
        }
        if (_.isEqual(name, CPNameType.Scale)) {
          setInitialValue({
            x: targetObject?.scale?.x ?? 0,
            y: targetObject?.scale?.y ?? 0,
            z: targetObject?.scale?.z ?? 0,
          });
        }
      });
    }
  }, [name, transformControls]);
  useEffect(() => {
    if (_.isEqual(name, CPNameType.Position)) {
      setInitialValue({
        x: currentBone?.position?.x ?? 0,
        y: currentBone?.position?.y ?? 0,
        z: currentBone?.position?.z ?? 0,
      });
    }
    if (_.isEqual(name, CPNameType.Rotation)) {
      setInitialValue({
        x: currentBone?.rotation?.x ?? 0,
        y: currentBone?.rotation?.y ?? 0,
        z: currentBone?.rotation?.z ?? 0,
      });
    }
    if (_.isEqual(name, CPNameType.Scale)) {
      setInitialValue({
        x: currentBone?.scale?.x ?? 0,
        y: currentBone?.scale?.y ?? 0,
        z: currentBone?.scale?.z ?? 0,
      });
    }
  }, [currentBone, name]);
  return (
    <S.CPListRowParentWrapper>
      <S.CPListRowInputWrapper>
        {name}
        <S.CPListRowInputsWrapper>
          <InputCP
            initialValue={initialValue.x}
            prefix="X"
            onDragMove={onDragMove}
            handleBlur={handleBlur}
            onKeyPress={onKeyPress}
            name={x}
          />
          <InputCP
            initialValue={initialValue.y}
            prefix="Y"
            onDragMove={onDragMove}
            handleBlur={handleBlur}
            onKeyPress={onKeyPress}
            name={y}
          />
          <InputCP
            initialValue={initialValue.z}
            prefix="Z"
            onDragMove={onDragMove}
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
