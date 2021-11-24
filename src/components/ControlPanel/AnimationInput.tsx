import { FunctionComponent, useState, useEffect, useCallback, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './AnimationInput.module.scss';

interface Props {
  className?: string;
  text?: string;
  defaultValue?: number;
  activeStatus?: boolean;
  decimalDigit?: number;
  func?: () => void;
}

const cx = classNames.bind(styles);

const AnimationInput: FunctionComponent<Props> = ({ className, text, defaultValue, activeStatus, decimalDigit, func }) => {
  const [currentValue, setCurrentValue] = useState<number>(defaultValue ? defaultValue : 0);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        setCurrentValue(+e.target.value);
        func && func();
      }
    },
    [func],
  );

  useEffect(() => {
    const decimalFixedValue = Number.parseFloat(currentValue + '').toFixed(decimalDigit ? decimalDigit : 1);

    inputRef.current!.value = decimalFixedValue;
  }, [currentValue, decimalDigit]);

  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={cx(classes)}>
      {text && <p>{text}</p>}
      <input
        type="number"
        onKeyUp={handleKeyUp}
        onBlur={(e) => {
          setCurrentValue(+e.target.value);
          func && func();
        }}
        tabIndex={activeStatus === undefined ? 0 : activeStatus ? 0 : -1}
        ref={inputRef}
      />
    </div>
  );
};

export default AnimationInput;
