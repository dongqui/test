// import { skeletonHelpersTypes } from 'interfaces';
// import _ from 'lodash';
// import { useCallback, useEffect } from 'react';

// const STANDARD_TIME_INTERVAL = 0.03;
// let skeletonHelpers: skeletonHelpersTypes[] = [];
export const useMakeSkeletonHelpers = ({}: // mixer,
// skeletonHelper,
// animationClip,
// currentAction,
// action,
{
  // mixer?: THREE.AnimationMixer;
  // skeletonHelper?: THREE.SkeletonHelper;
  // animationClip?: THREE.AnimationClip;
  // currentAction?: THREE.AnimationAction;
  // action: (skeletonHelpers: skeletonHelpersTypes[]) => void;
}) => {
  // const changeSkeletonHelpers = useCallback(
  //   ({ time }) => {
  //     if (!currentAction?.isRunning()) {
  //       currentAction?.play();
  //     }
  //     if (!_.isUndefined(mixer)) {
  //       mixer.timeScale = 0.99;
  //       mixer.setTime(time);
  //       mixer.timeScale = 0;
  //     }
  //     skeletonHelpers.push({
  //       time,
  //       bones: _.cloneDeep(
  //         _.map(skeletonHelper?.bones, (bone) => ({
  //           name: bone.name,
  //           positionX: bone.position.x,
  //           positionY: bone.position.y,
  //           positionZ: bone.position.z,
  //           quaternionX: bone.quaternion.x,
  //           quaternionY: bone.quaternion.y,
  //           quaternionZ: bone.quaternion.z,
  //           quaternionW: bone.quaternion.w,
  //           scaleX: bone.scale.x,
  //           scaleY: bone.scale.y,
  //           scaleZ: bone.scale.z,
  //         })),
  //       ),
  //     });
  //   },
  //   [currentAction, mixer, skeletonHelper],
  // );
  // useEffect(() => {
  //   if (!_.isUndefined(currentAction)) {
  //     const standardTime = _.range(0, animationClip?.duration, STANDARD_TIME_INTERVAL);
  //     currentAction?.play();
  //     skeletonHelpers = [];
  //     _.forEach(standardTime, (time, index) => {
  //       changeSkeletonHelpers({ time });
  //     });
  //     if (!_.isUndefined(mixer)) {
  //       mixer.timeScale = 0.99;
  //       mixer.setTime(0);
  //       mixer.timeScale = 0;
  //     }
  //     action(skeletonHelpers);
  //   }
  // }, [currentAction, changeSkeletonHelpers, mixer, animationClip?.duration, action]);
};
