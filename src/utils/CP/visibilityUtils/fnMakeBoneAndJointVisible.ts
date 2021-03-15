import * as THREE from 'three';
import _ from 'lodash';

interface FnMakeBoneAndJointInvisible {
  skeletonHelper: THREE.SkeletonHelper;
}

/**
 * Makes Bones and Joints in the scene visible.
 *
 * @param skeletonHelper - The skeleton helper in the scene
 *
 */
const fnMakeBoneAndJointInvisible = (props: FnMakeBoneAndJointInvisible) => {
  const { skeletonHelper } = props;
  skeletonHelper.visible = true;
  _.forEach(skeletonHelper.bones, (bone) => {
    // eslint-disable-next-line no-param-reassign
    bone.visible = true;
  });
};

export default fnMakeBoneAndJointInvisible;
