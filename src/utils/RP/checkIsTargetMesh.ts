import * as BABYLON from '@babylonjs/core';

/**
 * typeguard checking if the target is mesh or not(transformNode)
 *
 * @param target
 */
const checkIsTargetMesh = (target: BABYLON.TransformNode | BABYLON.Mesh): target is BABYLON.Mesh => {
  return target.getClassName() === 'Mesh';
};

export default checkIsTargetMesh;
