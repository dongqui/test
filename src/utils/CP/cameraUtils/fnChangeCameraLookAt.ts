import * as THREE from 'three';

type Axis = 'x' | 'y' | 'z';

interface FnChangeCameraLookAt {
  camera: THREE.PerspectiveCamera;
  axis: Axis;
  value: number;
}

/**
 * 카메라의 lookAt 속성을 변경합니다.
 * lookAt 은 카메라가 보는 점의 좌표를 의미합니다.
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
