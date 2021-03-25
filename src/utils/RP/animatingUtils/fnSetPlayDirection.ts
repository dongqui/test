import * as THREE from 'three';

type PlayDirection = 1 | -1;

interface FnSetPlayDirection {
  mixer: THREE.AnimationMixer;
  playDirection: PlayDirection;
}
/**
 * 애니메이션 mixer 의 재생 방향을 변경합니다.
 *
 * @param mixer - animation mixer
 * @param playDirection - 재생 방향
 *
 */
const fnSetPlayDirection = (props: FnSetPlayDirection) => {
  const { mixer, playDirection } = props;
  switch (playDirection) {
    case 1:
      if (mixer.timeScale < 0) {
        mixer.timeScale = -1 * mixer.timeScale;
      }
      break;
    case -1:
      if (mixer.timeScale > 0) {
        mixer.timeScale = -1 * mixer.timeScale;
      }
      break;
    default:
      break;
  }
};

export default fnSetPlayDirection;
