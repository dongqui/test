import * as BABYLON from '@babylonjs/core';
import { ScreenXY } from 'types/common';

/**
 * 대상 vector가 드래그 박스 범위 내에 속하는 지 판단합니다.
 *
 * @param start - 드래그 박스 생성 시작 시의 포인터 위치
 * @param end - 드래그를 끝냈을 때의 포인터 위치
 * @param vector - 판단 대상 vector
 * @param scene - dragBox와 pointer가 속하는 scene
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
