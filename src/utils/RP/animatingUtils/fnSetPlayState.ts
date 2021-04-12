import * as THREE from 'three';
import _ from 'lodash';

const DEFAULT_SPEED = 0.4;

type playState = 'play' | 'pause' | 'stop';

interface FnSetPlayState {
  mixer: THREE.AnimationMixer;
  currentAction: THREE.AnimationAction;
  playState: playState;
  playSpeed: number;
  startTimeIndex: number;
}
/**
 * 애니메이션 플레이 상태를 변경합니다.
 *
 * @param mixer - animation mixer
 * @param currentAction - 현재 mixer 에 등록된 animation action
 * @param playState - 미들바를 통해 변경 가능한 플레이 상태(play, pause, stop)
 * @param playSpeed - 재생 속도
 * @param startTimeIndex - start index
 *
 */
const fnSetPlayState = (props: FnSetPlayState) => {
  const { mixer, currentAction, playState, playSpeed, startTimeIndex } = props;
  switch (playState) {
    case 'play':
      mixer.timeScale = DEFAULT_SPEED * playSpeed;
      currentAction.play();
      currentAction.time = _.round(startTimeIndex / 30, 4);
      break;
    case 'pause':
      mixer.timeScale = 0;
      break;
    case 'stop':
      if (currentAction.isRunning()) {
        // mixer.stopAllAction();
        mixer.timeScale = 0;
        currentAction.time = 1 / 30;
      }
      break;
    default:
      break;
  }
};

export default fnSetPlayState;
