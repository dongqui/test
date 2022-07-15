import { Quaternion, TransformNode } from '@babylonjs/core';

export function copyTransformFrom(destNode: TransformNode, sourceNode: TransformNode) {
  destNode.position.copyFrom(sourceNode.position);
  destNode.scaling.copyFrom(sourceNode.scaling);
  destNode.rotation.copyFrom(sourceNode.rotation);

  if (sourceNode.rotationQuaternion) {
    if (!destNode.rotationQuaternion) {
      destNode.rotationQuaternion = new Quaternion();
    }
    destNode.rotationQuaternion.copyFrom(sourceNode.rotationQuaternion);
  } else {
    if (destNode.rotationQuaternion) {
      destNode.rotationQuaternion = null;
    }
  }
}
