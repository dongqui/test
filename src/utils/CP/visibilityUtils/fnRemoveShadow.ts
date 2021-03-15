import * as THREE from 'three';

interface FnRemoveShadow {
  dirLight: THREE.DirectionalLight;
}

/**
 * Removes a shadow from the directional light in the scene.
 *
 * @param dirLight - The target directional light
 *
 */
const fnRemoveShadow = (props: FnRemoveShadow) => {
  const { dirLight } = props;
  dirLight.castShadow = false;
};

export default fnRemoveShadow;
