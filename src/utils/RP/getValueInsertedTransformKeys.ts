import * as BABYLON from '@babylonjs/core';

/**
 * return transformKeys where new key is inserted to the target frame
 *
 * @param transformKeys - target transformKeys
 * @param targetFrame - target frame
 * @param value - target value
 */
const getValueInsertedTransformKeys = (transformKeys: BABYLON.IAnimationKey[], targetFrame: number, value: BABYLON.Vector3 | BABYLON.Quaternion): BABYLON.IAnimationKey[] => {
  if (transformKeys.find((key) => key.frame === targetFrame)) {
    // if a key already exist at the target frame, return after replacing the value at that frame
    return transformKeys.map((key) => (key.frame === targetFrame ? { frame: key.frame, value } : key));
  } else {
    // case where there isn't any key at the target frame
    if (transformKeys.length === 0) {
      // case empty array -> just add key
      return [{ frame: targetFrame, value }];
    } else {
      // case array with a key or keys, insert key at the target frame
      if (transformKeys[0].frame > targetFrame) {
        // case targetFrame < firstKey.frame
        return [{ frame: targetFrame, value }, ...transformKeys];
      } else if (transformKeys[transformKeys.length - 1].frame < targetFrame) {
        // case lastKey.frame < targetFrame
        return [...transformKeys, { frame: targetFrame, value }];
      } else {
        // case firstKey.frame < targetframe < lastKey.frame
        // cf) by the elimination, there are more than 1 key
        let idx = 0;
        for (; idx < transformKeys.length; idx += 1) {
          if (transformKeys[idx].frame > targetFrame) {
            break;
          }
        }
        return [...transformKeys.slice(0, idx), { frame: targetFrame, value }, ...transformKeys.slice(idx)];
      }
    }
  }
};

export default getValueInsertedTransformKeys;
