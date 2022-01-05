import * as BABYLON from '@babylonjs/core';

/**
 * parent bone을 재귀적으로 탐색하여 rotationQuaternion을 누적 계산한 quaternion 값을 구하여 반환합니다.
 *
 * @param bone - 대상 bone
 */
const getRecurrentRotationQuaternion = (bone: BABYLON.Bone) => {
  let target = bone;
  let result = BABYLON.Quaternion.Identity();

  const quaternions: BABYLON.Quaternion[] = [];

  quaternions.push(bone.getTransformNode()!.rotationQuaternion!.clone());

  while (target.getParent() && target.getParent()?.getClassName() === 'Bone') {
    target = target.getParent()!;
    quaternions.push(target.getTransformNode()!.rotationQuaternion!.clone());
  }

  const reversed = quaternions.reverse();
  reversed.forEach((q) => {
    result = result.multiply(q);
  });

  return new BABYLON.Quaternion(result.x, result.y, result.z, result.w);
};

export default getRecurrentRotationQuaternion;
