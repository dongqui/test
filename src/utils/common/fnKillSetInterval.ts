/**
 * 모든 쓰레드를 중지
 *
 */
export const fnKillSetInterval = () => {
  for (let i = 0; i < 99999; i++) {
    window.clearInterval(i);
  }
};
