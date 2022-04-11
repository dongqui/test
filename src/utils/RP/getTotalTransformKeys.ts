import { IAnimationKey, Quaternion, Vector3 } from '@babylonjs/core';
import { zipWith } from 'lodash';
import { PlaskProperty } from 'types/common';
import getLinearInterpolatedTransformKeys from './getLinearInterpolatedTransformKeys';
import getUnionFrames from './getUnionFrames';

/**
 *  return sum of position values in the give array
 *
 * @param values - target position array
 */
const getPositionSum = (values: Vector3[]) => {
  let sum = Vector3.Zero();
  values.forEach((value) => {
    sum = sum.add(value.clone());
  });

  return sum;
};

/**
 * return sum of quaternion values in the give array
 * compute sum through converting quaternion to eulers
 * 이때 Euler로 변환하여 연산 후 다시 재변환하는 과정을 거칩니다.
 *
 * @param values target quaternion array
 */
const getRotationQuaternionSum = (values: Quaternion[]) => {
  let sum = Quaternion.Identity();
  values.forEach((value) => {
    const e = value.clone().toEulerAngles();
    sum = sum.clone().toEulerAngles().add(e).toQuaternion();
  });

  return sum;
};

/**
 * return total multiplication of scaling values in the give array
 *
 * @param values target scaling array
 */
const getScalingSum = (values: Vector3[]) => {
  let sum = new Vector3(1, 1, 1);
  values.forEach((value) => {
    sum = new Vector3(sum.x * value.x, sum.y * value.y, sum.z * value.z);
  });

  return sum;
};

/**
 * return transfomKeys with total values of given transformKeys list
 *
 * @param transformKeysList - target transformKeys list (array of arrays of transformKey)
 * @param property - property of target track
 */
const getTotalTransformKeys = (transformKeysList: Array<IAnimationKey[]>, property: Omit<PlaskProperty, 'rotation'>) => {
  const unionFrames = getUnionFrames(transformKeysList);
  const linearInterpolatedTransformKeysList = transformKeysList.map((transformKeys) =>
    getLinearInterpolatedTransformKeys(transformKeys, unionFrames, property === 'rotationQuaternion'),
  );

  const totalTransformKeys = zipWith(...linearInterpolatedTransformKeysList, (...transformKeys) => {
    let value: Vector3 | Quaternion;
    if (property === 'position') {
      value = getPositionSum(transformKeys.map((key) => key.value));
    } else if (property === 'rotationQuaternion') {
      value = getRotationQuaternionSum(transformKeys.map((key) => key.value));
    } else {
      value = getScalingSum(transformKeys.map((key) => key.value));
    }

    return {
      frame: transformKeys[0].frame,
      value,
    };
  });

  return totalTransformKeys;
};

export default getTotalTransformKeys;
