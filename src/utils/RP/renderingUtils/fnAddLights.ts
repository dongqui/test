import * as THREE from 'three';

type UpDirection = 'y' | 'z';

interface FnAddLights {
  scene: THREE.Scene;
  upDirection: UpDirection;
}

/**
 * Adds a hemisphere light and a directional light to the scene.
 *
 * @param scene - The scene where lights will be attatched
 * @param upDirection - The target up direction of the scene and the camera
 *
 * @returns THREE.DirectionalLight for turning on/off the shadow
 *
 */
const fnAddLights = (props: FnAddLights) => {
  const { scene, upDirection } = props;
  const hemiLight = new THREE.HemisphereLight(0xaaaaaa);
  if (upDirection === 'y') {
    hemiLight.position.set(0, 20, 0);
  } else if (upDirection === 'z') {
    hemiLight.position.set(0, 0, 20);
  }
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
  if (upDirection === 'y') {
    dirLight.position.set(0, 20, 0);
  } else if (upDirection === 'z') {
    dirLight.position.set(0, 0, 20);
  }
  scene.add(dirLight);

  return dirLight;
};

export default fnAddLights;
