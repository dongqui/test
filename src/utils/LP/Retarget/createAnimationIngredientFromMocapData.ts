import { Quaternion, TransformNode, Vector3 } from '@babylonjs/core';
import { AnimationIngredient, PlaskMocapData, PlaskPose, PlaskRetargetMap } from 'types/common';
import { createAnimationIngredient } from 'utils/RP';

const DEFAULT_TIMEOUT = 3000;

/**
 * create animationIngredient with model and mocap
 *
 * @param assetId - asset's id
 * @param animationIngredientName - name of motion
 * @param retargetMap - object mapping target bones to source bones
 * @param initialPoses - initial pose of transformNodes included in the target asset
 * @param animatableTransformNodes - animatable transformNodes of the target asset
 * @param mocapData - mocap data extracted from video
 * @param timeout - timeout in ms
 */
const createAnimationIngredientFromMocapData = (
  assetId: string,
  animationIngredientName: string,
  retargetMap: PlaskRetargetMap,
  initialPoses: PlaskPose[],
  animatableTransformNodes: TransformNode[],
  mocapData: PlaskMocapData,
  timeout?: number,
): Promise<AnimationIngredient> => {
  // create empty animationIngredient and fill its tracks
  const emptyAnimationIngredient = createAnimationIngredient(assetId, animationIngredientName, [], animatableTransformNodes, true, false);

  const baseLayer = emptyAnimationIngredient.layers[0];

  const { tracks } = baseLayer;
  const { hipSpace } = retargetMap;

  // iterate mocapData not tracks for efficiency
  mocapData.forEach((mocapDatum) => {
    const { boneName, property, transformKeys } = mocapDatum;
    const targetTransformNodeId = retargetMap.values.find((value) => value.sourceBoneName === boneName)?.targetTransformNodeId;

    if (targetTransformNodeId) {
      if (property === 'rotationQuaternion') {
        // add transformKeys both rotation track and its peer rotationQuaternion track
        const targetRotationTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === 'rotation');
        const targetRotationQuaternionTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === 'rotationQuaternion');
        const targetInitialPose = initialPoses.find((initialPose) => initialPose.target.id === targetTransformNodeId)!;

        if (targetRotationTrack && targetRotationQuaternionTrack) {
          transformKeys.forEach((transformKey) => {
            const { frame, value } = transformKey;

            const targetQ = Quaternion.FromArray(value);
            const initialLocalQ = targetInitialPose.rotationQuaternion.clone();
            const recurrentQ = targetInitialPose.recurrentRotationQuaternion!.clone();
            const inversedRecurrentQ = Quaternion.Inverse(recurrentQ.clone());

            const q = initialLocalQ.multiply(inversedRecurrentQ).multiply(targetQ).multiply(recurrentQ);
            const e = q.toEulerAngles();

            targetRotationQuaternionTrack.transformKeys.push({ frame, value: q });
            targetRotationTrack.transformKeys.push({ frame, value: e });
          });
        }
      } else if (property === 'position') {
        const targetTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === property);

        if (targetTrack) {
          transformKeys.forEach((transformKey) => {
            const { frame, value } = transformKey;
            const newValue = value.map((v, idx) => (idx === 2 ? ((v * 100 - 106) * hipSpace) / 106 : (v * 100 * hipSpace) / 106));
            targetTrack.transformKeys.push({ frame, value: Vector3.FromArray(newValue) }); // the root mesh is scaled down to 1/100, all transformKeys have to have 100 * value
          });
        }
      } else if (property === 'scaling') {
        const targetTrack = tracks.find((track) => track.targetId === targetTransformNodeId && track.property === property);

        if (targetTrack) {
          transformKeys.forEach((transformKey) => {
            const { frame, value } = transformKey;
            targetTrack.transformKeys.push({ frame, value: Vector3.FromArray(value) });
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

export default createAnimationIngredientFromMocapData;
