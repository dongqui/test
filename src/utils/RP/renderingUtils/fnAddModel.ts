import * as THREE from 'three';
import { fnApplyDefaultSkin } from 'utils/RP/renderingUtils';

const SKIN_CHECK_DURATION = 1000;

// load 된 objcet 에 대해 타입 특정 시 에러 발생
interface FnAddModel {
  scene: THREE.Scene;
  object: any;
}

/**
 * Creates and add the model loaded from the input file to the scene.
 * When adding the model to the scene, there is an intentional delay created by setTimeout function.
 * During this delay, we check whether the model's skin is supported by THREE.js or not.
 * If not, we will apply the default skin to the model. (fnApplyDefaultSkin)
 * And this function also returns the model.
 *
 * @param scene - The scene where the model will be added
 * @param object - The object loaded with the THREE.GLTFLoader
 *
 * @returns the model of the object which will be renderer in the canvas
 *
 */
const fnAddModel = (props: FnAddModel) => {
  const { scene, object } = props;
  const model = object.scene || object.scenes[0];
  fnApplyDefaultSkin({ model });
  setTimeout(() => {
    scene.add(model);
  }, SKIN_CHECK_DURATION);
  model.traverse((obj: any) => {
    if (obj.isMesh) {
      // eslint-disable-next-line no-param-reassign
      obj.castShadow = true;
    }
  });
  return model;
};

export default fnAddModel;
