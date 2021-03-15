import * as THREE from 'three';

type Axis = 'x' | 'y' | 'z';

interface FnChangeBonePosition {
  targetBone: THREE.Bone;
  axis: Axis;
  value: number;
}

/**
 * Changes the position value of the target bone.
 *
 * @param targetBone - The target bone
 * @param axis - The target axis ('x' | 'y' | 'z')
 * @param value - The value of the position
 *
 */
const fnChangeBonePosition = (props: FnChangeBonePosition) => {
  const { targetBone, value, axis } = props;
  targetBone.position[axis] = value;
};

export default fnChangeBonePosition;
