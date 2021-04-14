/**
 * MAC 인지 여부를 반환
 *
 * @returns MAC 인지 여부
 */
const fnDetectIsMac = (): boolean => {
  return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
};

export default fnDetectIsMac;
