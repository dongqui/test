import * as THREE from 'three';

interface FnChangeFogNear {
  fog: THREE.Fog;
  value: number;
}

/**
 * Changes the near value of a fog.
 *
 * @param fog - The fog added to the scene
 * @param value - The fog near value
 *
 */
const fnChangeFogNear = (props: FnChangeFogNear) => {
  const { fog, value } = props;
  fog.near = value;
};

export default fnChangeFogNear;
