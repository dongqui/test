import { FunctionComponent, useState, useEffect, useCallback, useRef, FocusEvent } from 'react';
import { isUndefined } from 'lodash';
import classNames from 'classnames/bind';
import styles from './AnimationInput.module.scss';

const cx = classNames.bind(styles);

const DEFAULT_INACTIVE_MESSAGE = '';

interface Props {
  className?: string;
  currentValue?: number;
  text: string;
  defaultValue?: number;
  activeStatus?: boolean;
  inactiveMessage?: string;
  decimalDigit?: number;
  handleBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

const AnimationInput: FunctionComponent<Props> = ({ className, currentValue, text, defaultValue, activeStatus, inactiveMessage, decimalDigit, handleBlur }) => {
  // input의 값이 바뀌었는지 체크하기 위한 boolean 값, input이 focus 되면 기본적으로 값을 바꾸기 위해 접근한 것으로 간주
  const [isValueChanged, setIsValueChanged] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyUp = useCallback((event) => {
    if (event.key === 'Enter') {
      event.target.blur();
    }
  }, []);

  // 부모로부터 defaultValue만 전달받을 경우 해당 value에 decimalDigit의 숫자만큼의 소수점 자리수를 추가하는 로직
  // decimalDigit이 없다면 소수점 1자리로 고정
  useEffect(() => {
    if (!isValueChanged) {
      const decimalFixedValue = Number.parseFloat(defaultValue + '').toFixed(decimalDigit ?? 1);

      inputRef.current!.value = decimalFixedValue;
    }
  }, [decimalDigit, defaultValue, isValueChanged]);

  // 부모로부터 currentValue를 전달받을 경우 해당 value에 decimalDigit의 숫자만큼의 소수점 자리수를 추가하는 로직
  // decimalDigit이 없다면 소수점 1자리로 고정
  useEffect(() => {
    if (currentValue && !isValueChanged) {
      const decimalFixedValue = Number.parseFloat(currentValue + '').toFixed(decimalDigit ?? 1);

      inputRef.current!.value = decimalFixedValue;
    }
  }, [currentValue, decimalDigit, isValueChanged]);

  const classes = cx('wrapper', className, { able: activeStatus ?? true });

  return (
    <div className={classes}>
      <p>{text}</p>
      <input
        type="number"
        onKeyUp={handleKeyUp}
        onFocus={() => setIsValueChanged(true)}
        onBlur={(event) => {
          if (isValueChanged) {
            handleBlur && handleBlur(event);
            setIsValueChanged(false);
          }
        }}
        tabIndex={isUndefined(activeStatus) || activeStatus ? 0 : -1}
        ref={inputRef}
      />
      {/* activeStatus에 붙연놓은 input 비활성화 관련 div (placeholder의 역할) */}
      {!activeStatus && <div className={cx('input-inactive-overlay')}>{inactiveMessage ?? DEFAULT_INACTIVE_MESSAGE}</div>}
    </div>
  );
};

export default AnimationInput;
