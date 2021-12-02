import { FunctionComponent, useState, useEffect, useCallback, useRef, FocusEvent } from 'react';
import { isUndefined } from 'lodash';
import classNames from 'classnames/bind';
import styles from './AnimationInput.module.scss';

const cx = classNames.bind(styles);

interface Props {
  className?: string;
  text?: string;
  defaultValue?: number;
  activeStatus?: boolean;
  decimalDigit?: number;
  handleBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

const AnimationInput: FunctionComponent<Props> = ({ className, text, defaultValue, activeStatus, decimalDigit, handleBlur }) => {
  const [currentValue, setCurrentValue] = useState<number>(defaultValue ?? 0);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyUp = useCallback((event) => {
    if (event.key === 'Enter') {
      event.target.blur();
    }
  }, []);

  useEffect(() => {
    const decimalFixedValue = Number.parseFloat(currentValue + '').toFixed(decimalDigit ?? 1);

    inputRef.current!.value = decimalFixedValue;
  }, [currentValue, decimalDigit]);

  const classes = cx('wrapper', className, { able: activeStatus ?? true });

  return (
    <div className={cx(classes)}>
      {text && <p>{text}</p>}
      <input
        type="number"
        onKeyUp={handleKeyUp}
        onBlur={(event) => {
          setCurrentValue(parseFloat(event.target.value));
          handleBlur && handleBlur(event);
        }}
        tabIndex={isUndefined(activeStatus) || activeStatus === true ? 0 : -1}
        ref={inputRef}
      />
      {/* activeStatus에 붙연놓은 input 비활성화 관련 div (placeholder의 역할) */}
      {!activeStatus && <div className={cx('input-inactive-overlay')}>Inactive</div>}
    </div>
  );
};

export default AnimationInput;
