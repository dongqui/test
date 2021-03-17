import * as THREE from 'three';

interface FnAddAxes {
  scene: THREE.Scene;
}

/**
 * Creates and add axes to the scene. (default y-up)
 * And this function also returns x, y, z axes, for the case where the up-axis setting changes.
 *
 * @param scene - The scene where the axes will be added
 *
 * @returns x, y, z axes which can be added to the scene
 *
 */
const fnAddAxes = (props: FnAddAxes) => {
  const { scene } = props;
  const xMaterial = new THREE.LineBasicMaterial({ color: '#ea2027' });
  const xGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-500, 0, 0),
    new THREE.Vector3(500, 0, 0),
  ]);
  const xAxis = new THREE.Line(xGeometry, xMaterial);

  const yMaterial = new THREE.LineBasicMaterial({ color: '#20b812' });
  const yGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -500, 0),
    new THREE.Vector3(0, 500, 0),
  ]);
  const yAxis = new THREE.Line(yGeometry, yMaterial);

  const zMaterial = new THREE.LineBasicMaterial({ color: '#0652dd' });
  const zGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, -500),
    new THREE.Vector3(0, 0, 500),
  ]);
  const zAxis = new THREE.Line(zGeometry, zMaterial);

  scene.add(xAxis);
  scene.add(zAxis);

  return { xAxis, yAxis, zAxis };
};

export default fnAddAxes;
