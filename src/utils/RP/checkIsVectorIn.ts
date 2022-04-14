import { Matrix, Scene, Vector3 } from '@babylonjs/core';
import { ScreenXY } from 'types/common';

/**
 * check if the vector is in the dragBox's range
 *
 * @param start - start pointer position
 * @param end - end pointer position
 * @param vector - target vector
 * @param scene - scene which contains the dragBox and the pointer
 */
const checkIsVectorIn = (start: ScreenXY, end: ScreenXY, vector: Vector3, scene: Scene) => {
  const vectorScreenPosition = Vector3.Project(
    vector,
    Matrix.IdentityReadOnly,
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
