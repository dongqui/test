/**
 *
 * @example
 * ```
 * # Usage
 * const value = getNumberFromPx('358px'); // 358
 * ```
 * @param {string} targetPxValue - 숫자와 px을 분리하기위한 기존값
 * @returns {number} px을 분리한 값
 */
const getNumberFromPx = (targetPxValue: string): number => {
  return Number(targetPxValue.substr(0, targetPxValue.indexOf('px')));
};

export default getNumberFromPx;
