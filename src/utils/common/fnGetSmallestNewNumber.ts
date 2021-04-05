import _ from 'lodash';

/**
 * 건네 받은 배열에 들어있지 않은 가장 작은 정수를 반환
 *
 * @param array - target 배열
 */
const fnGetSmallestNewNumber = (array: number[]): number => {
  let targetValue = 0;

  _.map(array, (current, i) => {
    if (array[i + 1] - current > 1) {
      const minValue = _.min([array[i + 1], current]);

      if (minValue) {
        const min = minValue + 1;
        targetValue = min;
      }
    }
  });

  const result = targetValue || (_.max(array) || 0) + 1;

  return result;
};

export default fnGetSmallestNewNumber;
