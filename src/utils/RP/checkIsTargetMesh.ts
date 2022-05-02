import { Mesh, TransformNode } from '@babylonjs/core';

/**
 * typeguard checking if the target is mesh or not(transformNode)
 *
 * @param target
 */
const checkIsTargetMesh = (target: TransformNode | Mesh): target is Mesh => {
  return target.getClassName() === 'Mesh';
};

export default checkIsTargetMesh;
