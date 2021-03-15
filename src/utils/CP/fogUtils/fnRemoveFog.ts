import * as THREE from 'three';

interface FnRemoveFog {
  scene: THREE.Scene;
}

/**
 * Deletes the fog from the scene.
 *
 * @param scene - The scene where the fog will be attatched
 *
 */
const fnRemoveFog = (props: FnRemoveFog) => {
  const { scene } = props;
  scene.fog = null;
};

export default fnRemoveFog;
