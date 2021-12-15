import * as BABYLON from '@babylonjs/core';
import { zipWith } from 'lodash';
import getLinearInterpolatedTransformKeys from './getLinearInterpolatedTransformKeys';
import getUnionFrames from './getUnionFrames';

/**
 * Vector3 값들로 이루어진, 길이가 정해지지 않은 배열을 받아 총합을 반환합니다.
 *
 * @param values - 총합을 구할 Vector3 배열
 */
const getVectorSum = (values: BABYLON.Vector3[]) => {
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
const getQuaternionSum = (values: BABYLON.Quaternion[]) => {
  let sum = BABYLON.Quaternion.Identity();
  values.forEach((value) => {
    const e = value.clone().toEulerAngles();
    sum = sum.clone().toEulerAngles().add(e).toQuaternion();
  });

  return sum;
};

/**
 * transformKeys들을 배열로 받아서 하나의 합친 후 transformKeys로 반환
 *
 * @param transformKeysList - 합치는 대상이 되는 transformKeys들을 담은 배열
 * @param isQuaternionTrack - 합치는 트랙들이 rotationQuaternion 트랙들인지 여부
 */
const getTotalTransformKeys = (transformKeysList: Array<BABYLON.IAnimationKey[]>, isQuaternionTrack: boolean) => {
  const unionFrames = getUnionFrames(transformKeysList);
  const linearInterpolatedTransformKeysList = transformKeysList.map((transformKeys) => getLinearInterpolatedTransformKeys(transformKeys, unionFrames, isQuaternionTrack));

  const totalTransformKeys = zipWith(...linearInterpolatedTransformKeysList, (...transformKeys) => {
    return {
      frame: transformKeys[0].frame,
      value: isQuaternionTrack ? getQuaternionSum(transformKeys.map((key) => key.value)) : getVectorSum(transformKeys.map((key) => key.value)),
    };
  });

  return totalTransformKeys;
};

export default getTotalTransformKeys;
