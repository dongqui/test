import * as BABYLON from '@babylonjs/core';

/**
 * Return the quaternion value which is get by multiplying ancestral bones' rotations recurrently
 * cf) the result is same as the absolute rotation quaternion value
 *
 * @param bone - target bone
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
