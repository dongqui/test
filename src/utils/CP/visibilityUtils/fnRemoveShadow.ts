interface FnRemoveShadow {
  dirLight: THREE.DirectionalLight;
}

/**
 * 현재 scene에 그림자를 보이지 않도록 변경합니다.
 *
 * @param dirLight - The target directional light
 *
 */
const fnRemoveShadow = (props: FnRemoveShadow) => {
  const { dirLight } = props;
  dirLight.castShadow = false;
};

export default fnRemoveShadow;
