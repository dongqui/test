import { IAnimationKey } from '@babylonjs/core';
import OneEuroFilterForQuaternion from './OneEuroFilterForQuaternion';

/**
 * Filter transformKeys containing quaternion values.
 * cf. filter with OneEuro filter
 *
 * @param transformKeys - target transformKeys
 * @param minCutoff - filter minCutoff value
 * @param beta - filter beta value
 */
const filterQuaternion = (transformKeys: IAnimationKey[], minCutoff: number, beta: number): IAnimationKey[] => {
  const oneEuroFilterQuaternion = new OneEuroFilterForQuaternion(minCutoff, beta);
  const filteredTransformKeys = transformKeys.map((transformKey) => ({
    frame: transformKey.frame,
    value: oneEuroFilterQuaternion.calculate(transformKey.frame, transformKey.value),
  }));

  return filteredTransformKeys;
};

export default filterQuaternion;
