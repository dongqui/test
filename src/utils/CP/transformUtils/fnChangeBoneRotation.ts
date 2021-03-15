import * as THREE from 'three';

type Axis = 'x' | 'y' | 'z';

interface FnChangeBoneRotation {
  targetBone: THREE.Bone;
  axis: Axis;
  value: number;
}

/**
 * Changes the rotation value of the target bone.
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
