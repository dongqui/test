import * as BABYLON from '@babylonjs/core';

/**
 * 전달받은 transformKeys로부터 targetFrame에 해당하는 보간된 quaternion값을 반환합니다.
 *
 * @param transformKeys - quaternion값을 구하기 위한 transformKey 배열
 * @param targetFrame - 목표로 하는 frame
 */
const getInterpolatedQuaternion = (transformKeys: BABYLON.IAnimationKey[], targetFrame: number): BABYLON.Quaternion => {
  // 이때 transformKeys에는 frame이 targetFrame과 일치하는 값은 없음을 전제
  if (transformKeys.length === 0) {
    // 빈 배열인 경우 (0, 0, 0, 1)을 return
    return BABYLON.Quaternion.Identity();
  } else if (transformKeys.length === 1) {
    // transformKey가 1개인 경우 해당 값을 return
    return transformKeys[0].value as BABYLON.Quaternion;
  } else {
    // transformKey가 2개 이상인 경우
    if (transformKeys[0].frame > targetFrame) {
      // targetFrame이 첫번째 key 이전일 경우, 첫번째 key의 value를 return
      // targetFrame - o - o - o - o
      return transformKeys[0].value as BABYLON.Quaternion;
    } else if (transformKeys[transformKeys.length - 1].frame < targetFrame) {
      // targetFrame이 마지막 key 이후일 경우, 마지막 key의 value를 return
      // o - o - o - o - targetFrame
      return transformKeys[transformKeys.length - 1].value as BABYLON.Quaternion;
    } else {
      // targetFrame이 첫번째 key와 마지막 key 사이에 있는 경우, targetFrame 직전과 직후 key의 value들을 보간한 값을 return
      // o - o - targetFrame - o - o
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

      return BABYLON.Quaternion.Slerp(prev.value, current.value, dt);
    }
  }
};

export default getInterpolatedQuaternion;
