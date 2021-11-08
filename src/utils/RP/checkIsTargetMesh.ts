import * as BABYLON from '@babylonjs/core';

const checkIsTargetMesh = (arg: BABYLON.TransformNode | BABYLON.Mesh): arg is BABYLON.Mesh => {
  return arg.getClassName() === 'Mesh';
};

export default checkIsTargetMesh;
