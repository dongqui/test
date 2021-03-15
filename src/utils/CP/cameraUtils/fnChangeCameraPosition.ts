import * as THREE from 'three';

type Axis = 'x' | 'y' | 'z';

interface FnChangeCameraPosition {
  camera: THREE.PerspectiveCamera;
  axis: Axis;
  value: number;
}

/**
 * Changes the position value of the camera attached to the canvas.
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
