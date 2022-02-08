import * as BABYLON from '@babylonjs/core';
import { zipWith } from 'lodash';
import { PlaskProperty } from 'types/common';
import getLinearInterpolatedTransformKeys from './getLinearInterpolatedTransformKeys';
import getUnionFrames from './getUnionFrames';

/**
 * Position에 해당하는 Vector3 값들로 이루어진, 길이가 정해지지 않은 배열을 받아 총합을 반환합니다.
 *
 * @param values - 총합을 구할 Vector3(position) 배열
 */
const getPositionSum = (values: BABYLON.Vector3[]) => {
  let sum = BABYLON.Vector3.Zero();
  values.forEach((value) => {
    sum = sum.add(value.clone());
  });

  return sum;
};

/**
 * Quaternion 값들로 이루어진, 길이가 정해지지 않은 배열을 받아 총합을 반환합니다.
 * 이때 Euler로 변환하여 연산 후 다시 재변환하는 과정을 거칩니다.
 *
 * @param values 총합을 구할 Quaternion 배열
 */
const getRotationQuaternionSum = (values: BABYLON.Quaternion[]) => {
  let sum = BABYLON.Quaternion.Identity();
  values.forEach((value) => {
    const e = value.clone().toEulerAngles();
    sum = sum.clone().toEulerAngles().add(e).toQuaternion();
  });

  return sum;
};

/**
 * Scaling에 해당하는 Vector3 값들로 이루어진, 길이가 정해지지 않은 배열을 받아 총곱을 반환합니다.
 *
 * @param values 총곱을 구할 Vector3(scaling) 배열
 */
const getScalingSum = (values: BABYLON.Vector3[]) => {
  let sum = new BABYLON.Vector3(1, 1, 1);
  values.forEach((value) => {
    sum = new BABYLON.Vector3(sum.x * value.x, sum.y * value.y, sum.z * value.z);
  });

  return sum;
};

/**
 * transformKeys들을 배열로 받아서 하나의 합친 후 transformKeys로 반환
 *
 * @param transformKeysList - 합치는 대상이 되는 transformKeys들을 담은 배열
 * @param property - 합치는 트랙의 속성 종류
 */
const getTotalTransformKeys = (transformKeysList: Array<BABYLON.IAnimationKey[]>, property: Omit<PlaskProperty, 'rotation'>) => {
  const unionFrames = getUnionFrames(transformKeysList);
  const linearInterpolatedTransformKeysList = transformKeysList.map((transformKeys) =>
    getLinearInterpolatedTransformKeys(transformKeys, unionFrames, property === 'rotationQuaternion'),
  );

  const totalTransformKeys = zipWith(...linearInterpolatedTransformKeysList, (...transformKeys) => {
    let value: BABYLON.Vector3 | BABYLON.Quaternion;
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
