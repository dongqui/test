import * as THREE from 'three';

/**
 * Creates and returns the camera with default settings.
 *
 * @returns THREE.PerspectiveCamera
 *
 */
const fnCreateCamera = () => {
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(-10, 10, 2);
  camera.lookAt(0, 0, 0);

  return camera;
};

export default fnCreateCamera;
