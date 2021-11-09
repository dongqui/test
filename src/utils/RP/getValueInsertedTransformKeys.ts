import * as BABYLON from '@babylonjs/core';

const getValueInsertedTransformKeys = (
  transformKeys: BABYLON.IAnimationKey[],
  targetFrame: number,
  value: BABYLON.Vector3 | BABYLON.Quaternion,
): BABYLON.IAnimationKey[] => {
  if (transformKeys.find((key) => key.frame === targetFrame)) {
    // targetFrame에 위치한 key가 있을 때, 해당 값만 교체해서 return
    return transformKeys.map((key) =>
      key.frame === targetFrame ? { frame: key.frame, value } : key,
    );
  } else {
    // targetFrame에 위치한 key가 없을 때
    if (transformKeys.length === 0) {
      // 빈 배열일 때는 키 추가해서 return
      return [{ frame: targetFrame, value }];
    } else {
      // 배열에 key가 한 개 이상 존재할 때, 해당 위치에 넣어서 return
      if (transformKeys[0].frame > targetFrame) {
        // 첫번째 key의 frame보다 targetFrame이 이전일 때
        return [{ frame: targetFrame, value }, ...transformKeys];
      } else if (transformKeys[transformKeys.length - 1].frame < targetFrame) {
        // 마지막 key의 frame보다 targetFrame이 이후일 때
        return [...transformKeys, { frame: targetFrame, value }];
      } else {
        // 위의 조건 두개에 의해 keyframe이 1개인 경우는 제거되므로,
        // keyframe이 2개 이상이고 그 사이에 targetFrame이 들어가는 경우로 조건이 좁혀짐
        // targetFrame보다 커지는 frame을 기준으로 기존 transformKeys를 나눈 후 사이에 새로운 값을 집어넣음
        let idx = 0;
        for (; idx < transformKeys.length; idx += 1) {
          if (transformKeys[idx].frame > targetFrame) {
            break;
          }
        }
        return [
          ...transformKeys.slice(0, idx),
          { frame: targetFrame, value },
          ...transformKeys.slice(idx),
        ];
      }
    }
  }
};

export default getValueInsertedTransformKeys;
