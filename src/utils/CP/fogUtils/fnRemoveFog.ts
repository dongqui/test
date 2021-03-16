import * as THREE from 'three';

interface FnRemoveFog {
  scene: THREE.Scene;
}

/**
 * scene 에서 fog 를 제거합니다.
 *
 * @param scene - The scene where the fog will be attatched
 *
 */
const fnRemoveFog = (props: FnRemoveFog) => {
  const { scene } = props;
  scene.fog = null;
};

export default fnRemoveFog;
