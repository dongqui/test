/**
 * 사파리 감지
 *
 */
const detectSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};
export default detectSafari;
