import * as BABYLON from '@babylonjs/core';
import OneEuroFilterForVector from './OneEuroFilterForVector';

const filterVector = (transformKeys: BABYLON.IAnimationKey[], minCutoff: number, beta: number) => {
  const oneEuroFilterVector = new OneEuroFilterForVector(minCutoff, beta);
  const filteredTransformKeys = transformKeys.map((transformKey) =>
    oneEuroFilterVector.calculate(transformKey.frame, transformKey.value),
  );

  return filteredTransformKeys;
};

export default filterVector;
