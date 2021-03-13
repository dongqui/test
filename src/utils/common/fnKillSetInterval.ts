export const fnKillSetInterval = () => {
  for (let i = 0; i < 99999; i++) {
    window.clearInterval(i);
  }
};
