import { IAnimationKey, Quaternion, Vector3 } from '@babylonjs/core';
import { findIndex, findLastIndex } from 'lodash';

/**
 * Modify transformKeys to have a key for at all target frames and ruturn the result
 * (frame without key will be filled with a key containing linear interpolated value)
 * Can be used before calculating sum between layers
 *
 * @param transformKeys - target transformKeys
 * @param targetFrames - target frames
 * @param isQuaternionTrack - whether the track is for quaternion values or not (for vector values)
 */
const getLinearInterpolatedTransformKeys = (transformKeys: IAnimationKey[], targetFrames: number[], isQuaternionTrack: boolean): IAnimationKey[] => {
  if (transformKeys.length === 0) {
    return targetFrames.map((targetFrame) => ({ frame: targetFrame, value: isQuaternionTrack ? Quaternion.Identity() : Vector3.Zero() }));
  } else {
    const newTransformKeys: IAnimationKey[] = [];

    targetFrames.forEach((targetFrame, idx) => {
      if (targetFrame < transformKeys[0].frame) {
        newTransformKeys.push({ frame: targetFrame, value: transformKeys[0].value });
      } else if (targetFrame < transformKeys[transformKeys.length - 1].frame) {
        const targetTransformKey = transformKeys.find((key) => key.frame === targetFrame);
        if (targetTransformKey) {
          newTransformKeys.push({ frame: targetFrame, value: targetTransformKey.value });
        } else {
          const prevTimeIndex = findLastIndex(transformKeys, (key) => key.frame < targetFrame);
          const nextTimeIndex = findIndex(transformKeys, (key) => key.frame > targetFrame);
          const deltaTime = transformKeys[nextTimeIndex].frame - transformKeys[prevTimeIndex].frame;
          const deltaValue = isQuaternionTrack
            ? transformKeys[nextTimeIndex].value.toEulerAngles().subtract(transformKeys[prevTimeIndex].value.toEulerAngles()).toQuaternion()
            : transformKeys[nextTimeIndex].value.subtract(transformKeys[prevTimeIndex].value);
          const multiplier = (targetFrame - transformKeys[prevTimeIndex].frame) / deltaTime;
          const newValue = isQuaternionTrack
            ? transformKeys[prevTimeIndex].value.toEulerAngles().add(deltaValue.toEulerAngles().multiplyByFloats(multiplier, multiplier, multiplier)).toQuaternion()
            : transformKeys[prevTimeIndex].value.add(deltaValue.multiplyByFloats(multiplier, multiplier, multiplier));
          newTransformKeys.push({ frame: targetFrame, value: newValue });
        }
      } else if (targetFrame >= transformKeys[transformKeys.length - 1].frame) {
        newTransformKeys.push({ frame: targetFrame, value: transformKeys[transformKeys.length - 1].value });
      }
    });

    return newTransformKeys;
  }
};

export default getLinearInterpolatedTransformKeys;
