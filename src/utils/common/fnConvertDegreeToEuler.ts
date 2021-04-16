import _ from 'lodash';

interface FnConvertDegreeToEuler {
  degreeValue: number;
}

/**
 * degree 값을 euler 로 변환합니다.
 *
 * @param degreeValue - euler 로 변환할 degree 값
 *
 * @returns 변환한 euler 값
 */
const fnConvertDegreeToEuler = (props: FnConvertDegreeToEuler) => {
  const { degreeValue } = props;
  return (degreeValue * (2 * Math.PI)) / 360;
};

export default fnConvertDegreeToEuler;
