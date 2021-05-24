import _ from 'lodash';

/**
 * mask 에 맞게 00:00 형식으로 value 를 변환합니다.
 *
 * @param value - mask를 씌울 value
 *
 * @returns masked value
 */
const fnGetMaskedValue = (value: number) => {
  return new Date(value * 1000).toISOString().substr(11, 8).substr(2).replace(':', '');
};

export default fnGetMaskedValue;
