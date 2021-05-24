import { RefObject } from 'react';

/**
 * input ref의 current value 를 변경하는 함수입니다.
 *
 * @param ref - 대상 input ref
 * @param value - mask를 씌울 value
 *
 * @returns masked value
 */
const fnSetValue = (ref: RefObject<HTMLInputElement>, value: string | number) => {
  if (ref.current) {
    if (typeof value === 'string') {
      ref.current.value = value;
    } else {
      ref.current.value = value.toString();
    }
  }
};

export default fnSetValue;
