import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type Axis = 'x' | 'y' | 'z';

interface Value {
  x: number;
  y: number;
  z: number;
}

interface FnChangeCameraLookAt {
  cameraControls: OrbitControls;
  axis: Axis;
  value: Value;
}

/**
 * 카메라의 lookAt 속성을 변경합니다.
 * lookAt 은 카메라가 보는 점의 좌표를 의미합니다.
 *
 * @param cameraControls - The orbit cameraControls
 * @param axis - The target axis ('x' | 'y' | 'z')
 * @param value - The value of the point's position
 *
 */
const fnChangeCameraLookAt = (props: FnChangeCameraLookAt) => {
  const {
    cameraControls,
    value: { x, y, z },
    axis,
  } = props;
  cameraControls.object.lookAt(x, y, z);
  cameraControls.update();
};

export default fnChangeCameraLookAt;
