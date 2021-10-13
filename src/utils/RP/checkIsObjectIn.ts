import * as BABYLON from '@babylonjs/core';
import { ScreenXY } from 'types/common';
import { checkIsControllerIn, checkIsVectorIn } from '.';

/**
 * 대상 object가 드래그 박스 범위 내에 속하는 지 판단합니다.
 * object가 controller인지, joint인지에 따라 판단 기준을 달리합니다.
 * joint의 경우 origin에 해당하는 점을, controller의 경우 boundingBox의 모서리들을 바탕으로 생성한 9개 점들을 판단 기준으로 사용합니다.
 *
 * @param startPointerPosition - 드래그 박스 생성 시작 시의 포인터 위치
 * @param endPointerPosition - 드래그를 끝냈을 때의 포인터 위치
 * @param object - 판단 대상
 * @param scene - dragBox와 pointer가 속하는 scene
 */

const checkIsObjectIn = (
  startPointerPosition: ScreenXY,
  endPointerPosition: ScreenXY,
  object: BABYLON.Mesh | BABYLON.TransformNode,
  scene: BABYLON.Scene,
) => {
  if (object.getClassName() === 'TransformNode') {
    // joint(transformNode)일 때는 position을 바탕으로 판단
    return checkIsVectorIn(
      startPointerPosition,
      endPointerPosition,
      object.getAbsolutePosition(),
      scene,
    );
  } else {
    // controller일 때는 총 9개 점을 판단
    return checkIsControllerIn(
      startPointerPosition,
      endPointerPosition,
      object as BABYLON.Mesh,
      scene,
    );
  }
};

export default checkIsObjectIn;
