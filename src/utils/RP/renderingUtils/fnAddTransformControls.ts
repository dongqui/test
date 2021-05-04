import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

interface FnAddTransformControls {
  scene: THREE.Scene;
  camera: THREE.Camera | THREE.PerspectiveCamera;
  renderer: THREE.WebGL1Renderer;
  cameraControls: OrbitControls;
}

/**
 * Create transform controls with default settings and event listers, and adds it to the scene.
 * And this function also returns the camera controls.
 *
 * @param scene - The scene where the transform controls will be attatched
 * @param camera - The camera attached to the canvas
 * @param renderer - The renderer which has the domElement(canvas)
 * @param cameraControls - The camera controls attached to the canvas
 *
 * @returns TransformControls for add event listeners about bone's transform controls
 *
 */
const fnAddTransformControls = (props: FnAddTransformControls) => {
  const { scene, camera, renderer, cameraControls } = props;
  const transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.addEventListener('change', () => {
    renderer.render(scene, camera);
  });
  // event 에 대해 DragEvent 타입을 정의하면 value property 가 없다는 에러 발생
  transformControls.addEventListener('dragging-changed', (event: any) => {
    cameraControls.enabled = !event.value;
  });
  transformControls.addEventListener('objectChange', (e) => {
    // console.log(e.target.object.position.x);
  });
  scene.add(transformControls);

  return transformControls;
};

export default fnAddTransformControls;
