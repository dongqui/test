import * as THREE from 'three';

interface FnAddFog {
  scene: THREE.Scene;
  fogNear: number;
  fogFar: number;
}

/**
 * scene 에 fog 를 추가합니다.
 * 이때 fog 의 속성들은 넘겨받은 fogNear 와 fogFar 를 사용합니다.
 * 또한 fog 속성값 변경을 위해 생성한 fog 를 반환합니다.
 *
 * @param scene - The scene where the fog will be attatched
 * @param fogNear - fog near value
 * @param fogFar - fog far value
 *
 * @returns 생성된 fog
 *
 */
const fnAddFog = (props: FnAddFog) => {
  const { scene, fogNear, fogFar } = props;
  const fog = new THREE.Fog(0xbbbbbb, fogNear, fogFar);
  scene.fog = fog;
  return fog;
};

export default fnAddFog;
