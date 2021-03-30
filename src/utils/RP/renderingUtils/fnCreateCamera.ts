import * as THREE from 'three';

type UpDirection = 'y' | 'z';

interface FnCreateCamera {
  upDirection: UpDirection;
}

/**
 * Creates and returns the camera with default settings.
 *
 * @param upDirection - The axis of the scene's up direction
 *
 * @returns THREE.PerspectiveCamera
 *
 */
const fnCreateCamera = (props: FnCreateCamera) => {
  const { upDirection } = props;
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.lookAt(0, 0, 0);
  if (upDirection === 'y') {
    camera.position.set(-10, 10, 2);
  } else if (upDirection === 'z') {
    camera.position.set(10, 2, 10);
    camera.up.set(0, 0, 1);
  }
  return camera;
};

export default fnCreateCamera;
