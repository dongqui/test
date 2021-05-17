type Axis = 'w' | 'x' | 'y' | 'z';

interface FnChangeBoneQuaternion {
  targetBone: THREE.Bone;
  axis: Axis;
  value: number;
}

/**
 * 대상 Bone 의 quaternion value 를 변경합니다.
 * 이때, 인자로 축 정보를 받아 해당 축의 값을 변경합니다.
 *
 * @param targetBone - The target bone
 * @param axis - The target axis ('w' | 'x' | 'y' | 'z')
 * @param value - The value of the quaternion
 *
 */
const fnChangeBoneQuaternion = (props: FnChangeBoneQuaternion) => {
  const { targetBone, value, axis } = props;
  targetBone.quaternion[axis] = value;
};

export default fnChangeBoneQuaternion;
