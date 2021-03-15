import * as THREE from 'three';

interface FnAddFog {
  scene: THREE.Scene;
}

/**
 * Adds a default fog to the scene.
 *
 * @param scene - The scene where the fog will be attatched
 *
 */
const fnAddFog = (props: FnAddFog) => {
  const { scene } = props;
  scene.fog = new THREE.Fog(0xbbbbbb, 10, 80);
};

export default fnAddFog;
