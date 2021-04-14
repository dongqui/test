import * as THREE from 'three';
import _ from 'lodash';

const DEFAULT_SPEED = 0.4;

type PlayDirection = 1 | -1;
type PlayState = 'play' | 'pause' | 'stop';

interface FnSetPlayState {
  mixer: THREE.AnimationMixer;
  currentAction: THREE.AnimationAction;
  playState: PlayState;
  playSpeed: number;
  playDirection: PlayDirection;
  startTimeIndex: number;
}
/**
 * 애니메이션 플레이 상태를 변경합니다.
 *
 * @param mixer - animation mixer
 * @param currentAction - 현재 mixer 에 등록된 animation action
 * @param playState - 미들바를 통해 변경 가능한 플레이 상태(play, pause, stop)
 * @param playSpeed - 재생 속도
 * @param playDirection - 재생 방향
 * @param startTimeIndex - 정지 시 돌아갈 시점
 *
 */
const fnSetPlayState = (props: FnSetPlayState) => {
  const { mixer, currentAction, playState, playSpeed, playDirection, startTimeIndex } = props;
  switch (playState) {
    case 'play':
      if (playDirection === 1) {
        mixer.timeScale = 1 * DEFAULT_SPEED * playSpeed;
        currentAction.play();
      } else if (playDirection === -1) {
        mixer.timeScale = -1 * DEFAULT_SPEED * playSpeed;
        currentAction.play();
      }
      break;
    case 'pause':
      mixer.timeScale = 0;
      break;
    case 'stop':
      if (currentAction.isRunning()) {
        mixer.timeScale = 0;
        currentAction.time = startTimeIndex;
      }
      break;
    default:
      break;
  }
};

export default fnSetPlayState;
