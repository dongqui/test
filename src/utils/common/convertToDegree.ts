/**
 * radian 값을 degree로 변환한 값을 반환합니다.
 *
 * @param radian - 대상 radian 값
 */
const convertToDegree = (radian: number) => {
  return radian * (180 / Math.PI);
};

export default convertToDegree;
