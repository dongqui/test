import _ from 'lodash';

interface FnMakeBoneAndJointInvisible {
  skeletonHelper: THREE.SkeletonHelper;
}

/**
 * Bone 들과 Joint Mesh 들을 보이게 변경합니다.
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
