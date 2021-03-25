import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

type Axis = 'x' | 'y' | 'z';

interface FnChangeCameraPosition {
  cameraControls: OrbitControls;
  axis: Axis;
  value: number;
}

/**
 * 카메라의 position 속성을 변경합니다.
 *
 * @param cameraControls - The orbit cameraControls
 * @param axis - The target axis ('x' | 'y' | 'z')
 * @param value - The value of the position
 *
 */
const fnChangeCameraPosition = (props: FnChangeCameraPosition) => {
  const { cameraControls, value, axis } = props;
  cameraControls.object.position[axis] = value;
  cameraControls.update();
};

export default fnChangeCameraPosition;
