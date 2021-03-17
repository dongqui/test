import * as THREE from 'three';
import _ from 'lodash';

interface FnMakeBoneAndJointInvisible {
  skeletonHelper: THREE.SkeletonHelper;
}

/**
 * Bone 들과 Joint Mesh 들을 보이지 않게 변경합니다.
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
