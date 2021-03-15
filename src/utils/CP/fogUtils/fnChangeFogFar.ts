import * as THREE from 'three';

interface FnChangeFogFar {
  fog: THREE.Fog;
  value: number;
}

/**
 * Changes the far value of a fog.
 *
 * @param fog - The fog added to the scene
 * @param value - The fog far value
 *
 */
const fnChangeFogFar = (props: FnChangeFogFar) => {
  const { fog, value } = props;
  fog.far = value;
};

export default fnChangeFogFar;
