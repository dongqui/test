interface FnLogAnimationTime {
  action: THREE.AnimationAction;
}

/**
 * 재생바 이동에 참고할 수 있는 애니메이션 time 을 로깅하는 함수입니다.
 *
 * @param action - time 을 구할 action 입니다.
 */
const fnLogAnimationTime = (props: FnLogAnimationTime) => {
  const { action } = props;

  let reqId: number | undefined;

  const logAnimationTime = () => {
    // console.log(action.time);
  };

  const loop = () => {
    reqId = undefined;
    logAnimationTime();
    start();
  };

  const start = () => {
    if (!reqId) {
      reqId = requestAnimationFrame(loop);
    }
  };

  const stop = () => {
    if (reqId) {
      cancelAnimationFrame(reqId);
      reqId = undefined;
    }
  };

  start();

  setTimeout(() => {
    stop();
  }, 10000);
};

export default fnLogAnimationTime;
