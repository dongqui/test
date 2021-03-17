import * as THREE from 'three';

/**
 * Creates and returns the scene with default settings.
 *
 * @returns THREE.Scene
 *
 */
const fnCreateScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#454545');

  return scene;
};

export default fnCreateScene;
