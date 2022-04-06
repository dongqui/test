import { IAnimationKey } from '@babylonjs/core';
import { union } from 'lodash';

/**
 * return union array of frames from given transformKeys list's frames
 *
 * @param transformKeysList - target transformKeys list (array of arrays of transformKey)
 */
const getUnionFrames = (transformKeysList: Array<IAnimationKey[]>) => {
  const targetFrames: Array<number[]> = [];

  transformKeysList.forEach((transformKeys) => {
    targetFrames.push(transformKeys.map((key) => key.frame));
  });

  return union(...targetFrames).sort((a, b) => a - b);
};

export default getUnionFrames;
