import * as THREE from 'three';

// load 된 objcet 에 대해 타입 특정 시 에러 발생
interface FnCreateMixer {
  object: any;
}

/**
 * Creates and returns the animation mixer with default settings.
 *
 * @param object - The object loaded with the THREE.GLTFLoader
 *
 * @returns THREE.AnimationMixer
 *
 */
const fnCreateMixer = (props: FnCreateMixer) => {
  const { object } = props;
  const mixer = new THREE.AnimationMixer(object.scene);

  return mixer;
};

export default fnCreateMixer;
