import * as THREE from 'three';
import _ from 'lodash';

interface FnGoToSpecificTimeIndex {
  mixer: THREE.AnimationMixer;
  currentAction: THREE.AnimationAction;
  currentTimeIndex: number;
}
/**
 * 애니메이션을 특정 시점으로 이동합니다.
 *
 * @param mixer - animation mixer
 * @param currentAction - 대상 애니메이션
 * @param currentTimeIndex - 이동할 time index
 *
 */
const fnGoToSpecificTimeIndex = (props: FnGoToSpecificTimeIndex) => {
  const { mixer, currentAction, currentTimeIndex } = props;
  // setTime 을 위해서는 action 을 재생 시켜야 하고, timeScale 이 0 이 아니어야 한다.
  mixer.timeScale = 1;
  currentAction.play();
  mixer.setTime(_.round(currentTimeIndex * (1 / 30), 4));
  mixer.timeScale = 0;
};

export default fnGoToSpecificTimeIndex;
