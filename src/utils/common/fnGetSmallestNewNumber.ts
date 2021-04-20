import _ from 'lodash';

/**
 * 건네 받은 배열에 들어있지 않은 가장 작은 정수를 반환
 *
 * @param array - target 배열
 */
const fnGetSmallestNewNumber = (array: number[]): number => {
  let targetValue = 0;
  const sortedArray = array.sort((a, b) => a - b);

  _.map(sortedArray, (current, i) => {
    if (sortedArray[i + 1] - current > 1) {
      const minValue = _.min([sortedArray[i + 1], current]);

      if (minValue || minValue === 0) {
        targetValue = minValue + 1;
      }
    }
  });

  const result = targetValue || (_.max(sortedArray) || 0) + 1;

  return result;
};

export default fnGetSmallestNewNumber;
