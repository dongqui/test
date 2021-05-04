import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

interface FnCreateCameraControls {
  camera: THREE.Camera | THREE.PerspectiveCamera;
  renderer: THREE.WebGL1Renderer;
}

/**
 * Creates and returns the camera controls with default settings.
 * The camera controls enables the mouse to control the viewport
 *
 * @param camera - The camera attached to the canvas
 * @param renderer - The renderer which has the domElement(canvas)
 *
 * @returns OrbitControls for add event listeners about shortcuts
 *
 */
const fnCreateCameraControls = (props: FnCreateCameraControls) => {
  const { camera, renderer } = props;
  const cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.mouseButtons = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    LEFT: THREE.MOUSE.NONE,
    MIDDLE: THREE.MOUSE.PAN,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    RIGHT: THREE.MOUSE.NONE,
  };
  cameraControls.target.set(0, 0, 0);
  cameraControls.update();
  cameraControls.enabled = true;
  cameraControls.enablePan = true;
  cameraControls.maxDistance = 100;
  cameraControls.minZoom = 1.0001;
  // camera controls 안 움직이는 버그 방지를 위한 이벤트 리스너 부착
  cameraControls.addEventListener('change', () => {
    if (cameraControls.object.position.y > -1.01 && cameraControls.object.position.y < 0) {
      const { x, y, z } = cameraControls.object.position;
      cameraControls.object.position.set(x, y - 0.01, z);
    } else if (cameraControls.object.position.y < 1.01 && cameraControls.object.position.y > 0) {
      const { x, y, z } = cameraControls.object.position;
      cameraControls.object.position.set(x, y + 0.01, z);
    } else if (cameraControls.object.position.y > 100) {
      const { x, y, z } = cameraControls.object.position;
      cameraControls.object.position.set(x, y - 1, z);
    }
  });
  return cameraControls;
};

export default fnCreateCameraControls;
