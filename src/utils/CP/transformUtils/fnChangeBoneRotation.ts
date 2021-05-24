type Axis = 'x' | 'y' | 'z';

interface FnChangeBoneRotation {
  targetBone: THREE.Bone;
  axis: Axis;
  value: number;
}

/**
 * 대상 Bone 의 rotation value 를 변경합니다.
 * 이때, 인자로 축 정보를 받아 해당 축의 값을 변경합니다.
 *
 * @param targetBone - The target bone
 * @param axis - The target axis ('x' | 'y' | 'z')
 * @param value - The value of the rotation
 *
 */
const fnChangeBoneRotation = (props: FnChangeBoneRotation) => {
  const { targetBone, value, axis } = props;
  targetBone.rotation[axis] = value;
};

export default fnChangeBoneRotation;
