import * as THREE from 'three';

interface FnAddFog {
  scene: THREE.Scene;
}

/**
 * scene 에 fog 를 추가합니다.
 * 이때 fog 의 속성들은 기본값(color: 0xbbbbbb, near: 10, far: 80)을 가집니다.
 * 또한 fog 속성값 변경을 위해 생성한 fog 를 반환합니다.
 *
 * @param scene - The scene where the fog will be attatched
 *
 * @returns 생성된 fog
 *
 */
const fnAddFog = (props: FnAddFog) => {
  const { scene } = props;
  const fog = new THREE.Fog(0xbbbbbb, 10, 80);
  scene.fog = fog;
  return fog;
};

export default fnAddFog;
