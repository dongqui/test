import * as BABYLON from '@babylonjs/core';
import OneEuroFilterForVector from './OneEuroFilterForVector';

/**
 * vector value를 가진 transformKey들을 OneEuro 필터를 사용해 보정합니다.
 *
 * @param transformKeys - 보정할 transformKeys
 * @param minCutoff - 보정 연산 시 사용할 minCutoff
 * @param beta - 보정 연산 시 사용할 beta
 */
const filterVector = (transformKeys: BABYLON.IAnimationKey[], minCutoff: number, beta: number): BABYLON.IAnimationKey[] => {
  const oneEuroFilterVector = new OneEuroFilterForVector(minCutoff, beta);
  const filteredTransformKeys = transformKeys.map((transformKey) => ({
    frame: transformKey.frame,
    value: oneEuroFilterVector.calculate(transformKey.frame, transformKey.value),
  }));

  return filteredTransformKeys;
};

export default filterVector;
