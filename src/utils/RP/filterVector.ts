import * as BABYLON from '@babylonjs/core';
import OneEuroFilterForVector from './OneEuroFilterForVector';

const filterVector = (
  transformKeys: BABYLON.IAnimationKey[],
  minCutoff: number,
  beta: number,
): BABYLON.IAnimationKey[] => {
  const oneEuroFilterVector = new OneEuroFilterForVector(minCutoff, beta);
  const filteredTransformKeys = transformKeys.map((transformKey) => ({
    frame: transformKey.frame,
    value: oneEuroFilterVector.calculate(transformKey.frame, transformKey.value),
  }));

  return filteredTransformKeys;
};

export default filterVector;
