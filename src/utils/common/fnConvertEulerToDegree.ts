import _ from 'lodash';

interface FnConvertEulerToDegree {
  eulerValue: number;
}

/**
 * euler 값을 degree 로 변환합니다.
 *
 * @param eulerValue - degree 로 변환할 euler 값
 *
 * @returns 변환한 degree 값
 */
const fnConvertEulerToDegree = (props: FnConvertEulerToDegree) => {
  const { eulerValue } = props;
  return (eulerValue / (2 * Math.PI)) * 360;
};

export default fnConvertEulerToDegree;
