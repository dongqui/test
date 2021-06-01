interface FnRemoveShadow {
  directionalLight: THREE.DirectionalLight;
}

/**
 * 현재 scene에 그림자를 보이지 않도록 변경합니다.
 *
 * @param directionalLight - The target directional light
 *
 */
const fnRemoveShadow = (props: FnRemoveShadow) => {
  const { directionalLight } = props;
  directionalLight.castShadow = false;
};

export default fnRemoveShadow;
