import * as BABYLON from '@babylonjs/core';
import getUnionFrames from './getUnionFrames';

const getTotalTransformKeys = (transformKeysList: Array<BABYLON.IAnimationKey[]>) => {
  const unionFrames = getUnionFrames(transformKeysList);
};

export default getTotalTransformKeys;
