import * as THREE from 'three';

interface FnAddShadow {
  directionalLight: THREE.DirectionalLight;
}

/**
 * 현재 scene 에 그림자를 표시합니다.
 *
 * @param directionalLight - The target directional light
 *
 */
const fnAddShadow = (props: FnAddShadow) => {
  const { directionalLight } = props;
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize = new THREE.Vector2(1000, 1000);
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 1500;
  directionalLight.shadow.camera.left = 8.25 * -1;
  directionalLight.shadow.camera.right = 8.25;
  directionalLight.shadow.camera.top = 8.25;
  directionalLight.shadow.camera.bottom = 8.25 * -1;
};

export default fnAddShadow;
