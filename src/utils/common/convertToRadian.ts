/**
 * degree 값을 radian으로 변환한 값을 반환합니다.
 *
 * @param degree - 대상 degree 값
 */
const convertToRadian = (degree: number) => {
  return degree * (Math.PI / 180);
};

export default convertToRadian;
