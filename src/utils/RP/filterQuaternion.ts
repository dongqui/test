import * as BABYLON from '@babylonjs/core';
import OneEuroFilterForQuaternion from './OneEuroFilterForQuaternion';

const filterQuaternion = (
  transformKeys: BABYLON.IAnimationKey[],
  minCutoff: number,
  beta: number,
) => {
  const oneEuroFilterQuaternion = new OneEuroFilterForQuaternion(minCutoff, beta);
  const filteredTransformKeys = transformKeys.map((transformKey) =>
    oneEuroFilterQuaternion.calculate(transformKey.frame, transformKey.value),
  );

  return filteredTransformKeys;
};

export default filterQuaternion;
