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
 * @returns HemiLight and DirectionalLight for clearing and turning on/off the shadow
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

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.54);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize = new THREE.Vector2(1000, 1000);
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 1500;
  directionalLight.shadow.camera.left = 8.25 * -1;
  directionalLight.shadow.camera.right = 8.25;
  directionalLight.shadow.camera.top = 8.25;
  directionalLight.shadow.camera.bottom = 8.25 * -1;
  if (upDirection === 'y') {
    directionalLight.position.set(0, 20, 0);
  } else if (upDirection === 'z') {
    directionalLight.position.set(0, 0, 20);
  }
  scene.add(directionalLight);

  return { hemiLight, directionalLight };
};

export default fnAddLights;
