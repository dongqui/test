import * as THREE from 'three';

const SKIN_CHECK_DURATION = 1000;

// load 된 objcet의 model 에 대해 타입 특정 시 에러 발생
interface FnAddSkeletonHelper {
  scene: THREE.Scene;
  model: any;
}

/**
 * Creates a skeleton helper with the loaded model and adds it to the scene.
 * When adding the skeleton helper to the scene, there is an intentional delay created by setTimeout function.
 * During this delay, we check whether the model's skin is supported by THREE.js or not.
 * And this function also returns the skeleton helper.
 *
 * @param scene - The scene where the skeleton helper will be added
 * @param model - The model of the object loaded
 *
 * @returns THREE.SkeletonHelper where we can get the THREE.Bone[] data by accessing its bones property. (SkeletonHelper.bones)
 *
 */
const fnAddSkeletonHelper = (props: FnAddSkeletonHelper) => {
  const { scene, model } = props;
  const skeletonHelper = new THREE.SkeletonHelper(model);
  setTimeout(() => {
    scene.add(skeletonHelper);
  }, SKIN_CHECK_DURATION);

  return skeletonHelper;
};

export default fnAddSkeletonHelper;
