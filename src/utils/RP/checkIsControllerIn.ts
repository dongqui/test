import * as BABYLON from '@babylonjs/core';
import { ScreenXY } from 'types/common';
import { checkIsVectorIn } from './';

/**
 * check if target controller is in dragBox's range
 * check inner 9 points of contoller's boundingBox
 *
 * @param start - start pointer position
 * @param end - end pointer position
 * @param mesh - target controller
 * @param scene - scene which has the dragBox and the pointer
 */
const checkIsControllerIn = (start: ScreenXY, end: ScreenXY, mesh: BABYLON.Mesh, scene: BABYLON.Scene) => {
  mesh.computeWorldMatrix(true);
  const { centerWorld, vectorsWorld: worldVectors } = mesh.getBoundingInfo().boundingBox;
  const checkVectors = [centerWorld];

  const vectorTop = BABYLON.Vector3.Center(worldVectors[5], worldVectors[3]);
  const vectorLeft = BABYLON.Vector3.Center(worldVectors[3], worldVectors[6]);
  const vectorDown = BABYLON.Vector3.Center(worldVectors[6], worldVectors[1]);
  const vectorRight = BABYLON.Vector3.Center(worldVectors[1], worldVectors[5]);
  checkVectors.push(vectorTop);
  checkVectors.push(vectorLeft);
  checkVectors.push(vectorDown);
  checkVectors.push(vectorRight);
  checkVectors.push(BABYLON.Vector3.Center(vectorTop, vectorLeft));
  checkVectors.push(BABYLON.Vector3.Center(vectorLeft, vectorDown));
  checkVectors.push(BABYLON.Vector3.Center(vectorDown, vectorRight));
  checkVectors.push(BABYLON.Vector3.Center(vectorRight, vectorTop));

  for (let index = 0; index < 9; index += 1) {
    if (checkIsVectorIn(start, end, checkVectors[index], scene)) {
      return true;
    }
  }

  return false;
};

export default checkIsControllerIn;
