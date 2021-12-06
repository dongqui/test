import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, PlaskMocapData, PlaskRetargetMap } from 'types/common';
import { createAnimationIngredient } from 'utils/RP';

const DEFAULT_TIMEOUT = 3000;

const getRetargetedMocapData = (
  assetId: string,
  animationIngredientName: string,
  retargetMap: PlaskRetargetMap,
  animatableTransformNodes: BABYLON.TransformNode[],
  mocapData: PlaskMocapData,
  timeout?: number,
): Promise<AnimationIngredient> => {
  const emptyAnimationIngredient = createAnimationIngredient(assetId, animationIngredientName, [], animatableTransformNodes, true, false);

  // cloneDeep을 사용해서 tracks를 newTracks로 갈음하려고 했으나, 시간비용이 너무 커서 tracks에 추가해주는 방식으로 사용
  const { tracks } = emptyAnimationIngredient;

  // tracks가 아닌 mocapData를 iterate하는 방식으로 변경
  mocapData.forEach((mocapDatum) => {
    const { boneName, property, transformKeys } = mocapDatum;
    const targetTransformNodeId = retargetMap.values.find((value) => value.sourceBoneName === boneName)?.targetTransformNodeId;

    if (targetTransformNodeId) {
      if (property === 'rotationQuaternion') {
        // rotation 트랙과 rotationQuaternion 트랙 모두에 transformKeys 추가
        const targetRotationTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === 'rotation');
        const targetRotationQuaternionTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === 'rotationQuaternion');

        if (targetRotationTrack && targetRotationQuaternionTrack) {
          transformKeys.forEach((transformKey) => {
            const { frame, value } = transformKey;
            const q = BABYLON.Quaternion.FromArray(value);
            const e = q.clone().normalize().toEulerAngles();
            targetRotationQuaternionTrack.transformKeys.push({ frame, value: q });
            targetRotationTrack.transformKeys.push({ frame, value: e });
          });
        }
      } else {
        // 해당하는 트랙에 trasnformKeys 추가
        const targetTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === property);

        if (targetTrack) {
          transformKeys.forEach((transformKey) => {
            const { frame, value } = transformKey;
            targetTrack.transformKeys.push({ frame, value: BABYLON.Vector3.FromArray(value) });
          });
        }
      }
    }
  });

  return new Promise((resolve, reject) => {
    resolve(emptyAnimationIngredient);

    setTimeout(() => {
      reject("Timeout: Can't apply mocap data to this model");
    }, timeout ?? DEFAULT_TIMEOUT);
  });
};

export default getRetargetedMocapData;
