/**
 * 모든 쓰레드를 중지
 *
 */
const fnKillThread = () => {
  for (let i = 0; i < 99999; i++) {
    window.clearInterval(i);
  }
};
export default fnKillThread;
