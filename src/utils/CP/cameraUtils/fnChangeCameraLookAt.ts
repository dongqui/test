import * as THREE from 'three';

type Axis = 'x' | 'y' | 'z';

interface FnChangeCameraLookAt {
  camera: THREE.PerspectiveCamera;
  axis: Axis;
  value: number;
}

/**
 * Changes the position value of the point where the camera looks at.
 *
 * @param camera - The camera
 * @param axis - The target axis ('x' | 'y' | 'z')
 * @param value - The value of the point's position
 *
 */
const fnChangeCameraLookAt = (props: FnChangeCameraLookAt) => {
  const { camera, value, axis } = props;
  camera.position[axis] = value;
};

export default fnChangeCameraLookAt;
