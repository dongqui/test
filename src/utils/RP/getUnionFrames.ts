import * as BABYLON from '@babylonjs/core';
import { union } from 'lodash';

/**
 * 여러 transformKeys를 받아서 frames의 합집합에 해당하는 배열을 반환합니다.
 *
 * @param transformKeysList - union frames를 구할 transformKeys들
 */
const getUnionFrames = (transformKeysList: Array<BABYLON.IAnimationKey[]>) => {
  const targetFrames: Array<number[]> = [];

  transformKeysList.forEach((transformKeys) => {
    targetFrames.push(transformKeys.map((key) => key.frame));
  });

  return union(...targetFrames).sort((a, b) => a - b);
};

export default getUnionFrames;
