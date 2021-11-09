import * as BABYLON from '@babylonjs/core';

const defaultReflectionDirection = new BABYLON.Vector3(0, 1, 1);

/**
 * scene 전체를 비추는 반구형태의 조명을 추가합니다.
 *
 * @param scene - 조명을 추가할 scene
 * @param reflectionDirection - 빛이 반사되는 방향 default = (0, 1, 1)
 */
const createHemisphericLight = (scene: BABYLON.Scene, reflectionDirection?: BABYLON.Vector3) => {
  const hemisphericLight = new BABYLON.HemisphericLight('hemisphericLight', (reflectionDirection = defaultReflectionDirection), scene);
  hemisphericLight.intensity = 0.9;

  return hemisphericLight;
};

export default createHemisphericLight;
