import * as THREE from 'three';
import _ from 'lodash';

interface FnMakeBoneAndJointInvisible {
  skeletonHelper: THREE.SkeletonHelper;
}

/**
 * Makes Bones and Joints in the scene invisible.
 *
 * @param skeletonHelper - The skeleton helper in the scene
 *
 */
const fnMakeBoneAndJointInvisible = (props: FnMakeBoneAndJointInvisible) => {
  const { skeletonHelper } = props;
  skeletonHelper.visible = false;
  _.forEach(skeletonHelper.bones, (bone) => {
    // eslint-disable-next-line no-param-reassign
    bone.visible = false;
  });
};

export default fnMakeBoneAndJointInvisible;
