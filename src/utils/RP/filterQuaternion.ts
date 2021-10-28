import * as BABYLON from '@babylonjs/core';
import OneEuroFilterForQuaternion from './OneEuroFilterForQuaternion';

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
