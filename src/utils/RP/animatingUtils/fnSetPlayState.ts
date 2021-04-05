import * as THREE from 'three';

const DEFAULT_SPEED = 0.3;

type playState = 'play' | 'pause' | 'stop';

interface FnSetPlayState {
  mixer: THREE.AnimationMixer;
  currentAction: THREE.AnimationAction;
  playState: playState;
  playSpeed: number;
}
/**
 * 애니메이션 플레이 상태를 변경합니다.
 *
 * @param mixer - animation mixer
 * @param currentAction - 현재 mixer 에 등록된 animation action
 * @param playState - 미들바를 통해 변경 가능한 플레이 상태(play, pause, stop)
 * @param playSpeed - 재생 속도
 *
 */
const fnSetPlayState = (props: FnSetPlayState) => {
  const { mixer, currentAction, playState, playSpeed } = props;
  switch (playState) {
    case 'play':
      mixer.timeScale = DEFAULT_SPEED * playSpeed;
      currentAction.play();
      break;
    case 'pause':
      mixer.timeScale = 0;
      break;
    case 'stop':
      mixer.stopAllAction();
      currentAction.stop();
      break;
    default:
      break;
  }
};

export default fnSetPlayState;
