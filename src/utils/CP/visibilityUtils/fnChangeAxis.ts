import * as THREE from 'three';

type UpDirection = 'y' | 'z';

interface FnChangeAxis {
  upDirection: UpDirection;
  camera: THREE.PerspectiveCamera;
  ground: THREE.Mesh;
  scene: THREE.Scene;
  yAxis: THREE.Line;
  zAxis: THREE.Line;
}

/**
 * scene 의 축 방향 (y-up 또는 z-up)을 변경합니다.
 * 축 방향에 따라, camera 의 up 속성, ground 의 rotation 속성을 변경합니다.
 *
 * @param upDirection - The target up direction of the scene and the camera
 * @param camera - The camera attached to the canvas
 * @param ground - The ground mesh of the scene
 * @param scene - The scene where the axes can ba added
 * @param yAxis - y axis
 * @param zAxis - z axis
 *
 */
const fnChangeAxis = (params: FnChangeAxis) => {
  const { upDirection, camera, ground, scene, yAxis, zAxis } = params;
  if (upDirection === 'z') {
    camera.up.set(0, 0, 1);
    ground.rotation.x = -Math.PI;
    scene.remove(zAxis);
    scene.add(yAxis);
  } else if (upDirection === 'y') {
    camera.up.set(0, 1, 0);
    ground.rotation.x = -Math.PI / 2;
    scene.remove(yAxis);
    scene.add(zAxis);
  }
};

export default fnChangeAxis;
