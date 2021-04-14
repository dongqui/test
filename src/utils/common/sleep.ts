/**
 * 원하는 시간만큼 일시정지
 *
 */
const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
export default sleep;
