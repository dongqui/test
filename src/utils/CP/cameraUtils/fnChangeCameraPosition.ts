import * as THREE from 'three';

type Axis = 'x' | 'y' | 'z';

interface FnChangeCameraPosition {
  camera: THREE.PerspectiveCamera;
  axis: Axis;
  value: number;
}

/**
 * 카메라의 position 속성을 변경합니다.
 *
 * @param camera - The camera
 * @param axis - The target axis ('x' | 'y' | 'z')
 * @param value - The value of the position
 *
 */
const fnChangeCameraPosition = (props: FnChangeCameraPosition) => {
  const { camera, value, axis } = props;
  camera.position[axis] = value;
};

export default fnChangeCameraPosition;
