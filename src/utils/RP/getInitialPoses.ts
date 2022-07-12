import { filterAnimatableTransformNodes } from 'utils/common';
import * as BABYLON from '@babylonjs/core';
import { getRecurrentRotationQuaternion } from 'utils/RP';

export default function getInitialPoses(transformNodes: BABYLON.TransformNode[], skeletons: BABYLON.Skeleton[]) {
  return filterAnimatableTransformNodes(transformNodes).map((transformNode) => {
    const bone = skeletons[0].bones.find((bone) => bone.id === transformNode.id.replace('//transformNode', '//bone'))!;

    return {
      target: transformNode,
      position: transformNode.position.clone(),
      rotationQuaternion: transformNode.rotationQuaternion ? transformNode.rotationQuaternion.clone() : transformNode.rotation.clone().toQuaternion(),
      recurrentRotationQuaternion: bone ? getRecurrentRotationQuaternion(bone) : null,
      scaling: transformNode.scaling.clone(),
    };
  });
}
