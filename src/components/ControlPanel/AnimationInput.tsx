import { FunctionComponent, useState, useEffect, useCallback, useRef, FocusEvent } from 'react';
import { isUndefined } from 'lodash';
import classNames from 'classnames/bind';
import styles from './AnimationInput.module.scss';

const cx = classNames.bind(styles);

const DEFAULT_INACTIVE_MESSAGE = '';

interface Props {
  className?: string;
  currentValue?: number;
  text?: string;
  defaultValue?: number;
  activeStatus?: boolean;
  inactiveMessage?: string;
  decimalDigit?: number;
  handleBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

const AnimationInput: FunctionComponent<Props> = ({ className, currentValue, text, defaultValue, activeStatus, inactiveMessage, decimalDigit, handleBlur }) => {
  // const [currentValue, setCurrentValue] = useState<number>(defaultValue ?? 0);
  const [isValueChange, setIsValueChange] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyUp = useCallback((event) => {
    if (event.key === 'Enter') {
      event.target.blur();
    }
  }, []);

  // const handleDecimal = useCallback(
  //   (num: string) => {
  //     const decimalFixedValue = Number.parseFloat(num + '').toFixed(decimalDigit ?? 1);
  //   },
  //   [decimalDigit],
  // );

  useEffect(() => {
    if (!isValueChange) {
      const decimalFixedValue = Number.parseFloat(defaultValue + '').toFixed(decimalDigit ?? 1);

      console.log('active1');
      inputRef.current!.value = decimalFixedValue;
    }
  }, [decimalDigit, defaultValue, isValueChange]);

  useEffect(() => {
    if (currentValue && !isValueChange) {
      const decimalFixedValue = Number.parseFloat(currentValue + '').toFixed(decimalDigit ?? 1);

      console.log('active2');
      inputRef.current!.value = decimalFixedValue;
    }
  }, [currentValue, decimalDigit, isValueChange]);

  const classes = cx('wrapper', className, { able: activeStatus ?? true });

  return (
    <div className={cx(classes)}>
      {text && <p>{text}</p>}
      <input
        type="number"
        onKeyUp={handleKeyUp}
        onFocus={() => setIsValueChange(true)}
        onBlur={(event) => {
          // setCurrentValue(parseFloat(event.target.value));
          if (isValueChange) {
            handleBlur && handleBlur(event);
            setIsValueChange(false);
          }
        }}
        tabIndex={isUndefined(activeStatus) || activeStatus === true ? 0 : -1}
        ref={inputRef}
      />
      {/* activeStatus에 붙연놓은 input 비활성화 관련 div (placeholder의 역할) */}
      {!activeStatus && <div className={cx('input-inactive-overlay')}>{inactiveMessage ?? DEFAULT_INACTIVE_MESSAGE}</div>}
    </div>
  );
};

export default AnimationInput;
