import * as THREE from 'three';

interface FnAddLights {
  scene: THREE.Scene;
}

/**
 * Adds a hemisphere light and a directional light to the scene.
 *
 * @param scene - The scene where lights will be attatched
 *
 * @returns THREE.DirectionalLight for turning on/off the shadow
 *
 */
const fnAddLights = (props: FnAddLights) => {
  const { scene } = props;
  const hemiLight = new THREE.HemisphereLight(0xaaaaaa);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1000, 1000);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 1500;
  dirLight.shadow.camera.left = 8.25 * -1;
  dirLight.shadow.camera.right = 8.25;
  dirLight.shadow.camera.top = 8.25;
  dirLight.shadow.camera.bottom = 8.25 * -1;
  scene.add(dirLight);

  return dirLight;
};

export default fnAddLights;
