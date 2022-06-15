import { Animation, IAnimationKey, Quaternion, Scalar, Vector3 } from '@babylonjs/core';
import { PlaskProperty, PlaskPropertyFormat } from 'types/common';
import getInterpolatedQuaternion from './getInterpolatedQuaternion';
import getInterpolatedVector from './getInterpolatedVector';

export const getInterpolatedValue = (transformKeys: IAnimationKey[], plaskProperty: PlaskProperty, targetFrame: number): Quaternion | number | Vector3 => {
  if (PlaskPropertyFormat[plaskProperty] === Animation.ANIMATIONTYPE_VECTOR3) {
    return getInterpolatedVector(transformKeys, targetFrame);
  } else if (PlaskPropertyFormat[plaskProperty] === Animation.ANIMATIONTYPE_QUATERNION) {
    return getInterpolatedQuaternion(transformKeys, targetFrame);
  } else if (PlaskPropertyFormat[plaskProperty] === Animation.ANIMATIONTYPE_FLOAT) {
    if (transformKeys.length === 0) {
      // if there isn't any key
      return 0;
    } else if (transformKeys.length === 1) {
      // if there is only 1 key, return the value of that key
      return transformKeys[0].value;
    } else {
      // if there are more than 2 keys,
      if (transformKeys[0].frame > targetFrame) {
        // if target frame is earlier than the first key's frame, return the value of the first key
        // case: targetFrame - first - o - o - o
        return transformKeys[0].value;
      } else if (transformKeys[transformKeys.length - 1].frame < targetFrame) {
        // if target frame is later than the last key's frame, return the value of the last key
        // case: o - o - o - last - targetFrame
        return transformKeys[transformKeys.length - 1].value;
      } else {
        // if target frame is in between the first key's frame and the last key's frame, return linear interpolated value
        // case: first - o - targetFrame - o - last
        let prev = transformKeys[0];
        let current = transformKeys[1];
        let dt = 0;

        for (let i = 0; i < transformKeys.length - 1; i += 1) {
          prev = transformKeys[i];
          current = transformKeys[i + 1];

          if (current.frame >= targetFrame) {
            dt = 1 - (current.frame - targetFrame) / (current.frame - prev.frame);
            break;
          }
        }

        return Scalar.Lerp(prev.value, current.value, dt);
      }
    }
  }

  throw new Error('Unrecognized format for animation track');
};
