import * as BABYLON from '@babylonjs/core';
import { ScreenXY } from 'types/common';

/**
 * check if the vector is in the dragBox's range
 *
 * @param start - start pointer position
 * @param end - end pointer position
 * @param vector - target vector
 * @param scene - scene which contains the dragBox and the pointer
 */
const checkIsVectorIn = (start: ScreenXY, end: ScreenXY, vector: BABYLON.Vector3, scene: BABYLON.Scene) => {
  const vectorScreenPosition = BABYLON.Vector3.Project(
    vector,
    BABYLON.Matrix.IdentityReadOnly,
    scene.getTransformMatrix(),
    scene.activeCamera!.viewport.toGlobal(scene.getEngine().getRenderWidth(), scene.getEngine().getRenderHeight()),
  );

  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxX = Math.max(start.x, end.x);
  const maxY = Math.max(start.y, end.y);

  if (vectorScreenPosition.x >= minX && vectorScreenPosition.x <= maxX && vectorScreenPosition.y >= minY && vectorScreenPosition.y <= maxY) {
    return true;
  }
  return false;
};

export default checkIsVectorIn;
