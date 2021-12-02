import { FunctionComponent, Dispatch, SetStateAction, useRef, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './AnimationRangeInput.module.scss';

const cx = classNames.bind(styles);

interface Props {
  text: string;
  currentValue: number;
  setCurrentValue: Dispatch<SetStateAction<number>>;
  step?: number;
  currentMax?: number;
  activeStatus?: boolean;
  decimalDigit?: number;
  className?: string;
}

const AnimationRangeInput: FunctionComponent<Props> = ({ className, text, step, currentMax, currentValue, setCurrentValue, activeStatus, decimalDigit }) => {
  const [progressBar, setProgressBar] = useState<number>(100);

  const rangeRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRangeInput = useCallback(
    (e) => {
      inputRef.current!.value = e.target.value;
      setCurrentValue(+e.target.value);
      setProgressBar((+rangeRef.current!.value * 100) / +rangeRef.current!.max);
    },
    [setCurrentValue],
  );

  const handleSelectText = useCallback(() => {
    inputRef.current!.select();
  }, []);

  const handleDigit = useCallback((baseNum: number, multiNum: number) => {
    const digit = (Math.floor(baseNum) + '').length;

    return (Math.pow(10, digit - 1) * multiNum).toString();
  }, []);

  // slider의 max 값을 구하기 위한 로직
  const handleMaxLimit = useCallback(
    (e) => {
      const num = e.target.value;
      const numToStrArray = (num + '').split('');

      if (+numToStrArray[0] > 5 && num > 10) {
        const getNewMax = handleDigit(num, 10);

        if (num > +getNewMax) {
          return;
        } else {
          rangeRef.current!.max = getNewMax;
        }
      } else if (+numToStrArray[0] === 1 && num > 10) {
        const getNewMax = handleDigit(num, 2);
        const compareNum = handleDigit(num, 1);

        if (num > +getNewMax) {
          return;
        } else if (compareNum === num) {
          rangeRef.current!.max = num;
        } else {
          rangeRef.current!.max = getNewMax;
        }
      } else if (+numToStrArray[0] > 2 && +numToStrArray[0] <= 5 && num > 10) {
        const getNewMax = handleDigit(num, 5);

        if (num > +getNewMax) {
          rangeRef.current!.max = handleDigit(num, 10);
        } else {
          rangeRef.current!.max = getNewMax;
        }
      } else if (num <= 10 && num > 5) {
        rangeRef.current!.max = 10 + '';
      } else if (num > 2 && num < 5) {
        rangeRef.current!.max = 5 + '';
      } else if (num <= 2 && num > 1) {
        rangeRef.current!.max = 2 + '';
      } else if (num <= 1) {
        rangeRef.current!.max = 1 + '';
      }

      setProgressBar((+rangeRef.current!.value * 100) / +rangeRef.current!.max);
    },
    [handleDigit],
  );

  const handleSetCurrentValue = useCallback(
    (e) => {
      setCurrentValue(+e.target.value);
      handleMaxLimit(e);
      rangeRef.current!.value = e.target.value;
    },
    [setCurrentValue, handleMaxLimit],
  );

  const handleKeyboard = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSetCurrentValue(e);
        inputRef.current!.blur();
      }
    },
    [handleSetCurrentValue],
  );

  useEffect(() => {
    if (rangeRef) {
      rangeRef.current!.value = currentMax + '';
      // console.log((+rangeRef.current!.value * 100) / +rangeRef.current!.max);
      // console.log('currentMax: ', currentMax);
    }
  }, [currentMax]);

  useEffect(() => {
    const decimalFixedValue = Number.parseFloat(currentValue + '').toFixed(decimalDigit ? decimalDigit : 1);

    inputRef.current!.value = decimalFixedValue;
  }, [currentValue, decimalDigit]);

  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={cx(classes)}>
      <p>{text}</p>
      <div className={cx('input-container', { able: activeStatus === undefined ? true : activeStatus })}>
        <input
          type="range"
          step={step}
          placeholder="0.0"
          min={0}
          max={currentMax}
          onChange={handleRangeInput}
          onMouseUp={handleMaxLimit}
          ref={rangeRef}
          tabIndex={activeStatus ? 0 : -1}
          style={{ backgroundSize: rangeRef.current ? `${progressBar}% 100%` : `100% 100%` }}
        />
        <input
          type="number"
          step={step}
          placeholder="0.0"
          onFocus={handleSelectText}
          onKeyUp={handleKeyboard}
          onBlur={handleSetCurrentValue}
          ref={inputRef}
          tabIndex={activeStatus ? 0 : -1}
          defaultValue={currentMax}
        />
      </div>
    </div>
  );
};

export default AnimationRangeInput;
