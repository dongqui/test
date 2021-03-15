import * as THREE from 'three';

type Axis = 'x' | 'y' | 'z';

interface FnChangeBoneScale {
  targetBone: THREE.Bone;
  axis: Axis;
  value: number;
}

/**
 * Changes the scale value of the target bone.
 *
 * @param targetBone - The target bone
 * @param axis - The target axis ('x' | 'y' | 'z')
 * @param value - The value of the scale
 *
 */
const fnChangeBoneScale = (props: FnChangeBoneScale) => {
  const { targetBone, value, axis } = props;
  targetBone.scale[axis] = value;
};

export default fnChangeBoneScale;
