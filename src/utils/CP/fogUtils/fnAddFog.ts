import * as THREE from 'three';

interface FnAddFog {
  scene: THREE.Scene;
}

/**
 * scene 에 fog 를 추가합니다.
 * 이때 fog 의 속성들은 기본값(color: 0xbbbbbb, near: 10, far: 80)을 가집니다.
 *
 * @param scene - The scene where the fog will be attatched
 *
 */
const fnAddFog = (props: FnAddFog) => {
  const { scene } = props;
  scene.fog = new THREE.Fog(0xbbbbbb, 10, 80);
};

export default fnAddFog;
