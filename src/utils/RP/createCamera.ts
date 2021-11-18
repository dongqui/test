import * as BABYLON from '@babylonjs/core';
import PlaskArcRotateCameraPointersInput from './PlaskArcRotateCameraPointersInput';

const defaultPosition = new BABYLON.Vector3(0, 6, 10);

/**
 * 축을 중심으로 회전하는 카메라를 커스텀 컨트롤을 적용한 상태로 생성합니다.
 *
 * @param scene - 카메라 및 카메라 컨트롤을 추가할 scene
 * @param initialPosition - 카메라의 초기 위치 default = (0, 6, 10)
 */
const createCamera = (scene: BABYLON.Scene, initialPosition?: BABYLON.Vector3) => {
  const arcRotateCamera = new BABYLON.ArcRotateCamera('arcRotateCamera', 0, 6, 10, BABYLON.Vector3.Zero(), scene);
  arcRotateCamera.setPosition((initialPosition = defaultPosition));
  arcRotateCamera.attachControl(scene.getEngine().getRenderingCanvas(), false);
  arcRotateCamera.allowUpsideDown = false;
  arcRotateCamera.minZ = 0.1;
  arcRotateCamera.inertia = 0.5;
  arcRotateCamera.wheelPrecision = 50;
  arcRotateCamera.wheelDeltaPercentage = 0.01;
  arcRotateCamera.lowerRadiusLimit = 0.1;
  arcRotateCamera.upperRadiusLimit = 20;
  arcRotateCamera.pinchPrecision = 50;
  arcRotateCamera.panningAxis = new BABYLON.Vector3(1, 1, 0);
  arcRotateCamera.panningInertia = 0.5;
  arcRotateCamera.panningDistanceLimit = 20;

  // 기본 카메라 컨트롤을 삭제
  arcRotateCamera.inputs.remove(arcRotateCamera.inputs.attached.pointers);
  // 커스텀한 카메라 컨트롤을 적용
  arcRotateCamera.inputs.add(new PlaskArcRotateCameraPointersInput());
  arcRotateCamera._panningMouseButton = 1;

  return arcRotateCamera;
};

export default createCamera;
