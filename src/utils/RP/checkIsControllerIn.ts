import * as BABYLON from '@babylonjs/core';
import { ScreenXY } from 'types/common';
import { checkIsVectorIn } from './';

/**
 * 대상 controller가 드래그 박스 범위에 속하는 지 판단합니다.
 * controller의 boundingBox의 모서리들을 바탕으로 생성한 9개 점들을 판단 기준으로 사용합니다.
 *
 * @param start - 드래그 박스 생성 시작 시의 포인터 위치
 * @param end - 드래그를 끝냈을 때의 포인터 위치
 * @param mesh - 판단 대상 컨트롤러
 * @param scene - dragBox와 pointer가 속하는 scene
 */
const checkIsControllerIn = (
  start: ScreenXY,
  end: ScreenXY,
  mesh: BABYLON.Mesh,
  scene: BABYLON.Scene,
) => {
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
