import * as BABYLON from '@babylonjs/core';
import { findIndex, findLastIndex } from 'lodash';

/**
 * 전달받은 targetFrames을 기준으로, key를 가지지 않은 frame에 선형보간을 통해 계산한 값을 넣어줍니다.
 * layer간 transformKeys를 합치기 전 전처리 과정에서 사용할 수 있습니다.
 *
 * @param transformKeys - 선형 보간할 transformKeys
 * @param targetFrames - 기준 frames
 * @param isQuaternion - 트랙이 quaternion인지 여부. value가 Vector3인지 Quaternion인지 구분하기 위함.
 */
const getLinearInterpolatedTransformKeys = (transformKeys: BABYLON.IAnimationKey[], targetFrames: number[], isQuaternion: boolean): BABYLON.IAnimationKey[] => {
  if (transformKeys.length === 0) {
    // layer간 transformKeys를 합하는 연산에서 결과에 영향을 주지 않도록
    return targetFrames.map((targetFrame) => ({ frame: targetFrame, value: isQuaternion ? BABYLON.Quaternion.Identity() : BABYLON.Vector3.Zero() }));
  } else {
    const newTransformKeys: BABYLON.IAnimationKey[] = [];

    targetFrames.forEach((targetFrame, idx) => {
      if (targetFrame < transformKeys[0].frame) {
        newTransformKeys.push({ frame: targetFrame, value: transformKeys[0].value });
      } else if (targetFrame < transformKeys[transformKeys.length - 1].frame) {
        const targetTransformKey = transformKeys.find((key) => key.frame === targetFrame);
        if (targetTransformKey) {
          newTransformKeys.push({ frame: targetFrame, value: targetTransformKey.value });
        } else {
          const prevTimeIndex = findLastIndex(transformKeys, (key) => key.frame < targetFrame);
          const nextTimeIndex = findIndex(transformKeys, (key) => key.frame > targetFrame);
          const deltaTime = transformKeys[nextTimeIndex].frame - transformKeys[prevTimeIndex].frame;
          const deltaValue = isQuaternion
            ? transformKeys[nextTimeIndex].value.toEulerValues.subtract(transformKeys[prevTimeIndex].value.toEulerValues).toQuaternion.normalize()
            : transformKeys[nextTimeIndex].value.subtract(transformKeys[prevTimeIndex].value);
          const multiplier = (targetFrame - transformKeys[prevTimeIndex].frame) / deltaTime;
          const newValue = isQuaternion
            ? transformKeys[prevTimeIndex].value.toEulerValues.add(deltaValue.toEulerValues().multiplyByFloats(multiplier, multiplier, multiplier)).toQuaternion.normalize()
            : transformKeys[prevTimeIndex].value.add(deltaValue.multiplyByFloats(multiplier, multiplier, multiplier));
          newTransformKeys.push({ frame: targetFrame, value: newValue });
        }
      } else if (targetFrame >= transformKeys[transformKeys.length - 1].frame) {
        newTransformKeys.push({ frame: targetFrame, value: transformKeys[transformKeys.length - 1].value });
      }
    });

    return newTransformKeys;
  }
};

export default getLinearInterpolatedTransformKeys;
