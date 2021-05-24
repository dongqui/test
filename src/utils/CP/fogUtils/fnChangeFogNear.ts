interface FnChangeFogNear {
  fog: THREE.Fog;
  value: number;
}

/**
 * fog 의 near 값을 변경합니다.
 * near 속성은 fog 의 시작 지점을 결정합니다.
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
