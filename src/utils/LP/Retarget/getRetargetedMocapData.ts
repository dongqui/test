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

  tracks.forEach((track) => {
    // track의 transformNode를 target으로 가지는 sourceBone의 이름을 retargetMap에서 찾음
    const sourceBoneName = retargetMap.values.find((value) => value.targetTransformNodeId === track.targetId)?.sourceBoneName;
    if (sourceBoneName) {
      const mocapDatum = mocapData.find((datum) => datum.boneName === sourceBoneName && datum.property === track.property);
      // mocapData 중 해당 sourceBoneName 및 property를 대상으로 하는 datum을 찾음
      if (mocapDatum) {
        const { transformKeys } = mocapDatum;
        transformKeys.forEach((key) => {
          const { frame, value } = key;
          track.transformKeys.push({ frame, value: track.property === 'rotationQuaternion' ? BABYLON.Quaternion.FromArray(value) : BABYLON.Vector3.FromArray(value) });
        });
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
