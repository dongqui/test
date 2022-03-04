import * as BABYLON from '@babylonjs/core';
import { ScreenXY } from 'types/common';
import { checkIsControllerIn, checkIsVectorIn } from '.';
import checkIsTargetMesh from './checkIsTargetMesh';

/**
 * check if the object is in the dragBox's range
 * criteira depends on whether the object is controller or joint
 *
 * @param startPointerPosition - start pointer poisition
 * @param endPointerPosition - end pointer position
 * @param object - target object
 * @param scene - scene which contains the dragBox and the pointer
 */

const checkIsObjectIn = (startPointerPosition: ScreenXY, endPointerPosition: ScreenXY, object: BABYLON.Mesh | BABYLON.TransformNode, scene: BABYLON.Scene) => {
  if (object.getClassName() === 'TransformNode') {
    // select only if transformNode's corresponding joint is visible
    const joint = scene.getMeshById(object.id.replace('transformNode', 'joint'));
    if (joint && !joint.isVisible) {
      return false;
    }

    // check the origin point for transformNode
    return checkIsVectorIn(startPointerPosition, endPointerPosition, object.getAbsolutePosition(), scene);
  } else {
    // select only if controller is visible
    if (checkIsTargetMesh(object) && !object.isVisible) {
      return false;
    }
    // checkout 9 points for controller
    return checkIsControllerIn(startPointerPosition, endPointerPosition, object as BABYLON.Mesh, scene);
  }
};

export default checkIsObjectIn;
