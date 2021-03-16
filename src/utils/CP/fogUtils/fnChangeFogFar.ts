import * as THREE from 'three';

interface FnChangeFogFar {
  fog: THREE.Fog;
  value: number;
}

/**
 * fog 의 far 값을 변경합니다.
 * far 속성은 fog 의 끝 지점을 결정합니다.
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
