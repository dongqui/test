import * as BABYLON from '@babylonjs/core';

const defaultPosition = new BABYLON.Vector3(0, 10, 10);
const defaultDirection = new BABYLON.Vector3(0, 1, 0);

/**
 * 광원에서 특정 방향으로 비추는 조명을 추가합니다.
 *
 * @param scene - 조명을 추가할 scene
 * @param position - 광원의 위치 default = (0, 10, 10)
 * @param direction - 조명의 방향 default = (0, 1, 0)
 */
const createDirectionalLight = (scene: BABYLON.Scene, position?: BABYLON.Vector3, direction?: BABYLON.Vector3) => {
  const directionalLight = new BABYLON.DirectionalLight('directionalLight', (direction = defaultDirection), scene);
  directionalLight.position = position ?? defaultPosition;
  directionalLight.intensity = 0.1;

  return directionalLight;
};

export default createDirectionalLight;
