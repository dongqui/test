import * as THREE from 'three';

interface FnAddShadow {
  dirLight: THREE.DirectionalLight;
}

/**
 * Adds a shadow to the directional light in the scene.
 *
 * @param dirLight - The target directional light
 *
 */
const fnAddShadow = (props: FnAddShadow) => {
  const { dirLight } = props;
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1000, 1000);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 1500;
  dirLight.shadow.camera.left = 8.25 * -1;
  dirLight.shadow.camera.right = 8.25;
  dirLight.shadow.camera.top = 8.25;
  dirLight.shadow.camera.bottom = 8.25 * -1;
};

export default fnAddShadow;
