import * as BABYLON from '@babylonjs/core';
import OneEuroFilterForQuaternion from './OneEuroFilterForQuaternion';

/**
 * quaternion value를 가진 transformKey들을 OneEuro 필터를 사용해 보정합니다.
 *
 * @param transformKeys - 보정할 transformKeys
 * @param minCutoff - 보정 연산 시 사용할 minCutoff
 * @param beta - 보정 연산 시 사용할 beta
 */
const filterQuaternion = (
  transformKeys: BABYLON.IAnimationKey[],
  minCutoff: number,
  beta: number,
): BABYLON.IAnimationKey[] => {
  const oneEuroFilterQuaternion = new OneEuroFilterForQuaternion(minCutoff, beta);
  const filteredTransformKeys = transformKeys.map((transformKey) => ({
    frame: transformKey.frame,
    value: oneEuroFilterQuaternion.calculate(transformKey.frame, transformKey.value),
  }));

  return filteredTransformKeys;
};

export default filterQuaternion;
