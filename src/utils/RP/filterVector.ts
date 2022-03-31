import { IAnimationKey } from '@babylonjs/core';
import OneEuroFilterForVector from './OneEuroFilterForVector';

/**
 * Filter transformKeys containing vector values.
 * cf. filter with OneEuro filter
 *
 * @param transformKeys - target transformKeys
 * @param minCutoff - filter minCutoff value
 * @param beta - filter beta value
 */
const filterVector = (transformKeys: IAnimationKey[], minCutoff: number, beta: number): IAnimationKey[] => {
  const oneEuroFilterVector = new OneEuroFilterForVector(minCutoff, beta);
  const filteredTransformKeys = transformKeys.map((transformKey) => ({
    frame: transformKey.frame,
    value: oneEuroFilterVector.calculate(transformKey.frame, transformKey.value),
  }));

  return filteredTransformKeys;
};

export default filterVector;
