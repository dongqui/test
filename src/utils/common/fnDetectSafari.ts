/**
 * 사파리 감지
 *
 */
const fnDetectSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};
export default fnDetectSafari;
