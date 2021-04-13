interface FnLoopCallBack {
  callback: () => any;
}

/**
 * 받은 콜백 함수를 사용해 loop 를 구현합니다.
 *
 * @param callback - 반복할 콜백함수 입니다.
 *
 * @returns - loop 를 시작, 정지하는 함수를 반환합니다.
 *
 */
const fnLoopCallBack = (props: FnLoopCallBack) => {
  const { callback } = props;

  let reqId: number | undefined;

  const loop = () => {
    reqId = undefined;
    callback();
    startLoop();
  };

  const startLoop = () => {
    if (!reqId) {
      reqId = requestAnimationFrame(loop);
    }
  };

  const stopLoop = () => {
    if (reqId) {
      cancelAnimationFrame(reqId);
      reqId = undefined;
    }
  };

  return {
    startLoop,
    stopLoop,
  };
};

export default fnLoopCallBack;
