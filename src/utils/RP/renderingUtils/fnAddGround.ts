import * as THREE from 'three';

type UpDirection = 'y' | 'z';

interface FnAddGround {
  scene: THREE.Scene;
  camera: THREE.Camera | THREE.PerspectiveCamera;
  renderer: THREE.WebGL1Renderer;
  upDirection: UpDirection;
}

/**
 * Adds a ground to the scene with default settings and a default texture.
 * And this function also returns the created ground so that we can change its rotation value when changing up-axis.
 *
 * @param scene - The scene where the ground will be attatched
 * @param camera - The camera which is attached to the canvas
 * @param renderer - The renderer which has the domElement(canvas)
 * @param upDirection - The axis of the scene's up direction
 *
 * @returns THREE.Mesh for changing up direction
 *
 */
const fnAddGround = (props: FnAddGround) => {
  const { scene, camera, renderer, upDirection } = props;
  const texture = new THREE.TextureLoader().load('texture/texture_01.png', () => {
    renderer.render(scene, camera);
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(300, 300);
  const ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 1000),
    new THREE.MeshPhongMaterial({
      color: '#454545',
      map: texture,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  ground.position.set(0, 0, 0);
  if (upDirection === 'y') {
    ground.rotation.x = -Math.PI / 2;
  } else if (upDirection === 'z') {
    ground.rotation.x = -Math.PI;
  }
  ground.receiveShadow = true;
  scene.add(ground);
  return ground;
};

export default fnAddGround;
