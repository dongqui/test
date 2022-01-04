import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, PlaskMocapData, PlaskPose, PlaskRetargetMap } from 'types/common';
import { createAnimationIngredient } from 'utils/RP';

const DEFAULT_TIMEOUT = 3000;

/**
 * mocap 결과물과 model을 결합해 대상 model에 결속된 animationIngredient를 생성합니다.
 *
 * @param assetId - 대상 model(asset)의 id
 * @param animationIngredientName - 생성할 animationIngredient의 이름
 * @param retargetMap - source와 target을 연결한 데이터
 * @param initialPoses - 대상 model의 transformNode들의 초기 포즈
 * @param animatableTransformNodes - model의 transformNode들 중 animation에 사용가능한 대상들
 * @param mocapData - mocap 결과물
 * @param timeout -
 */
const createAnimationIngredientFromMocapData = (
  assetId: string,
  animationIngredientName: string,
  retargetMap: PlaskRetargetMap,
  initialPoses: PlaskPose[],
  animatableTransformNodes: BABYLON.TransformNode[],
  mocapData: PlaskMocapData,
  timeout?: number,
): Promise<AnimationIngredient> => {
  const emptyAnimationIngredient = createAnimationIngredient(assetId, animationIngredientName, [], animatableTransformNodes, true, false);

  // cloneDeep을 사용해서 tracks를 newTracks로 갈음하려고 했으나, 시간비용이 너무 커서 tracks에 추가해주는 방식으로 사용
  const { tracks } = emptyAnimationIngredient;
  const { hipSpace } = retargetMap;

  // tracks가 아닌 mocapData를 iterate하는 방식으로 변경
  mocapData.forEach((mocapDatum) => {
    const { boneName, property, transformKeys } = mocapDatum;
    const targetTransformNodeId = retargetMap.values.find((value) => value.sourceBoneName === boneName)?.targetTransformNodeId;

    if (targetTransformNodeId) {
      if (property === 'rotationQuaternion') {
        // rotation 트랙과 rotationQuaternion 트랙 모두에 transformKeys 추가
        const targetRotationTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === 'rotation');
        const targetRotationQuaternionTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === 'rotationQuaternion');
        const targetInitialPose = initialPoses.find((initialPose) => initialPose.target.id === targetTransformNodeId)!;

        if (targetRotationTrack && targetRotationQuaternionTrack) {
          transformKeys.forEach((transformKey) => {
            const { frame, value } = transformKey;

            const targetQ = BABYLON.Quaternion.FromArray(value);
            const initialLocalQ = targetInitialPose.rotationQuaternion.clone();

            const q = initialLocalQ.multiply(targetQ);
            const e = q.toEulerAngles();

            targetRotationQuaternionTrack.transformKeys.push({ frame, value: q });
            targetRotationTrack.transformKeys.push({ frame, value: e });
          });
        }
      } else if (property === 'position') {
        // 해당하는 트랙에 trasnformKeys 추가
        const targetTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === property);

        if (targetTrack) {
          transformKeys.forEach((transformKey) => {
            const { frame, value } = transformKey;
            const newValue = value.map((v, idx) => (idx === 2 ? ((v * 100 - 106) * hipSpace) / 106 : (v * 100 * hipSpace) / 106));
            targetTrack.transformKeys.push({ frame, value: BABYLON.Vector3.FromArray(newValue) }); // Armature가 1/100 되어있기 때문에, 모든 값에 100배를 더해 줌
          });
        }
      } else if (property === 'scaling') {
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

  // const boneDirection = bone.getDirection(bone.rotation.clone(), bone.getTransformNode());

  return new Promise((resolve, reject) => {
    resolve(emptyAnimationIngredient);

    setTimeout(() => {
      reject("Timeout: Can't apply mocap data to this model");
    }, timeout ?? DEFAULT_TIMEOUT);
  });
};

export default createAnimationIngredientFromMocapData;
