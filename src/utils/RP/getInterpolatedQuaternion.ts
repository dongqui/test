import { IAnimationKey, Quaternion } from '@babylonjs/core';

/**
 * return interpolated quaternion value for target frame
 *
 * @param transformKeys - transformKeys with quaternion values
 * @param targetFrame - target frame
 */
const getInterpolatedQuaternion = (transformKeys: IAnimationKey[], targetFrame: number): Quaternion => {
  // under assumption that there is no key at the target frame within the transformKeys
  if (transformKeys.length === 0) {
    // if there isn't any key, return Quaternion.Identity (0, 0, 0, 1)
    return Quaternion.Identity();
  } else if (transformKeys.length === 1) {
    // if there is only 1 key, return the value of that key
    return transformKeys[0].value as Quaternion;
  } else {
    // if there are more than 2 keys,
    if (transformKeys[0].frame > targetFrame) {
      // if target frame is earlier than the first key's frame, return the value of the first key
      // case: targetFrame - first - o - o - o
      return transformKeys[0].value as Quaternion;
    } else if (transformKeys[transformKeys.length - 1].frame < targetFrame) {
      // if target frame is later than the last key's frame, return the value of the last key
      // case: o - o - o - last - targetFrame
      return transformKeys[transformKeys.length - 1].value as Quaternion;
    } else {
      // if target frame is in between the first key's frame and the last key's frame, return linear interpolated value
      // case: first - o - targetFrame - o - last
      let prev = transformKeys[0];
      let current = transformKeys[1];
      let dt = targetFrame / (current.frame - prev.frame);

      for (let i = 0; i < transformKeys.length - 1; i += 1) {
        prev = transformKeys[i];
        current = transformKeys[i + 1];

        if (current.frame > targetFrame) {
          dt = targetFrame / (current.frame - prev.frame);
          break;
        }
      }

      return Quaternion.Slerp(prev.value, current.value, dt);
    }
  }
};

export default getInterpolatedQuaternion;
