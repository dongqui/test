import * as BABYLON from '@babylonjs/core';

/**
 * 대상이 mesh인지 transformNode인지 판단하는 타입가드입니다.
 *
 * @param target - mesh 여부 판단 대상
 */
const checkIsTargetMesh = (target: BABYLON.TransformNode | BABYLON.Mesh): target is BABYLON.Mesh => {
  return target.getClassName() === 'Mesh';
};

export default checkIsTargetMesh;
