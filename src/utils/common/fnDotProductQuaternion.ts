/**
 * 두 쿼터니언 값 배열에 대해 dotProduct 연산을 적용한 새로운 쿼터니언 값 배열을 반환합니다.
 *
 * @param q1 - 첫번째 quaternion
 * @param q2 - 두번째 quaternion
 *
 * @returns dotProduct 연산 적용한 새로운 쿼터니언
 */
const fnDotProductQuaternion = (q1: number[], q2: number[]) => {
  const newQuaternion: number[] = [];
  newQuaternion.push(q1[3] * q2[0] + q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1]);
  newQuaternion.push(q1[3] * q2[1] + q1[1] * q2[3] + q1[2] * q2[0] - q1[0] * q2[2]);
  newQuaternion.push(q1[3] * q2[2] + q1[2] * q2[3] + q1[0] * q2[1] - q1[1] * q2[0]);
  newQuaternion.push(q1[3] * q2[3] - q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2]);
  return newQuaternion;
};

export default fnDotProductQuaternion;
