import { FunctionComponent, Dispatch, SetStateAction, useRef, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './AnimationRangeInput.module.scss';

const cx = classNames.bind(styles);

const DEFAULT_INACTIVE_MESSAGE = '';

interface Props {
  text: string;
  currentValue: number;
  setCurrentValue: Dispatch<SetStateAction<number>>;
  step?: number;
  currentMax?: number;
  activeStatus?: boolean;
  inactiveMessage?: string;
  decimalDigit?: number;
  className?: string;
}

const AnimationRangeInput: FunctionComponent<Props> = ({ className, text, step, currentMax, currentValue, setCurrentValue, activeStatus, inactiveMessage, decimalDigit }) => {
  // range input 혹은 text input의 값이 변경되었는지 확인하는 트리거
  const [isValueChanged, setIsValueChanged] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const [progressBar, setProgressBar] = useState<number>(100);

  const rangeRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRangeInput = useCallback(
    (e) => {
      setIsValueChanged(true);
      inputRef.current!.value = e.target.value;
      setCurrentValue(+e.target.value);
      setProgressBar((+rangeRef.current!.value * 100) / +rangeRef.current!.max);
    },
    [setCurrentValue],
  );

  const handleSelectText = useCallback(() => {
    setIsFocused(true);
    inputRef.current!.select();
  }, []);

  const setDigit = useCallback((baseNum: number, multiNum: number) => {
    const digit = (Math.floor(baseNum) + '').length;

    return (Math.pow(10, digit - 1) * multiNum).toString();
  }, []);

  const getMaxLimitLogic = useCallback(
    (num: number) => {
      const numToStrArray = (num + '').split('');

      if (+numToStrArray[0] > 5 && num > 10) {
        const getNewMax = setDigit(num, 10);

        if (num > +getNewMax) {
          return;
        } else {
          rangeRef.current!.max = getNewMax;
        }
      } else if (+numToStrArray[0] === 1 && num > 10) {
        const getNewMax = setDigit(num, 2);
        const compareNum = setDigit(num, 1);

        if (num > +getNewMax) {
          return;
        } else if (compareNum === num + '') {
          rangeRef.current!.max = num + '';
        } else {
          rangeRef.current!.max = getNewMax;
        }
      } else if (+numToStrArray[0] > 2 && +numToStrArray[0] <= 5 && num > 10) {
        const getNewMax = setDigit(num, 5);

        if (num > +getNewMax) {
          rangeRef.current!.max = setDigit(num, 10);
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

      rangeRef.current!.value = num + '';
      setProgressBar((+rangeRef.current!.value * 100) / +rangeRef.current!.max);
    },
    [setDigit],
  );

  // slider의 max 값을 구하기 위한 로직
  const handleMaxLimit = useCallback(
    (e) => {
      const num = e.target.value;
      getMaxLimitLogic(num);
      setIsValueChanged(false);
    },
    [getMaxLimitLogic],
  );

  const setMaxLimitCurrentValue = useCallback(
    (currentValue: number) => {
      getMaxLimitLogic(currentValue);
    },
    [getMaxLimitLogic],
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
    if (rangeRef && (currentValue || currentValue === 0)) {
      if (!isValueChanged) {
        rangeRef.current!.value = currentValue + '';
        setMaxLimitCurrentValue(currentValue);
      }
    }
  }, [currentMax, currentValue, setMaxLimitCurrentValue, isValueChanged]);

  useEffect(() => {
    if (!isFocused) {
      const decimalFixedValue = Number.parseFloat(currentValue + '').toFixed(decimalDigit ? decimalDigit : 1);

      inputRef.current!.value = decimalFixedValue;
    }
  }, [currentValue, decimalDigit, isFocused]);

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
          onBlur={(e) => {
            handleSetCurrentValue(e);
            setIsFocused(false);
          }}
          ref={inputRef}
          tabIndex={activeStatus ? 0 : -1}
          defaultValue={currentMax}
        />
        {!activeStatus && <div className={cx('input-inactive-overlay')}>{inactiveMessage ?? DEFAULT_INACTIVE_MESSAGE}</div>}
      </div>
    </div>
  );
};

export default AnimationRangeInput;
