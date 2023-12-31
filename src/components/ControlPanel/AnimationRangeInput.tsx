import { FunctionComponent, useRef, useCallback, useEffect, useState, ChangeEvent } from 'react';
import classNames from 'classnames/bind';
import styles from './AnimationRangeInput.module.scss';

const cx = classNames.bind(styles);

const DEFAULT_INACTIVE_MESSAGE = '';

interface Props {
  text: string;
  currentValue: number;
  step?: number;
  currentMax?: number;
  activeStatus?: boolean;
  inactiveMessage?: string;
  decimalDigit?: number;
  className?: string;
  limitMax?: number;
  onChangeEnd?: (inputValue: number) => void;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const AnimationRangeInput: FunctionComponent<React.PropsWithChildren<Props>> = ({
  className,
  text,
  step,
  currentMax,
  currentValue,
  activeStatus,
  inactiveMessage,
  decimalDigit,
  limitMax,
  onChangeEnd,
  handleChange,
}) => {
  // range input 혹은 text input의 값이 변경되었는지 확인하는 상태값
  const [isValueChanged, setIsValueChanged] = useState<boolean>(false);
  // text input이 focus 되었는지 확인하는 상태값
  const [isFocused, setIsFocused] = useState<boolean>(false);
  // range input의 active한 값만큼의 범위만을 색상 변경하기 위한 상태값 100%를 기준으로 잡아야하므로 기본값 100 지정
  const [progressBar, setProgressBar] = useState<number>(100);

  const rangeRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // text input을 focus하면 text 전체를 선택하는 함수 (한 번에 해당 input의 모든 값을 변경하기 위함)
  const handleSelectText = useCallback(() => {
    setIsFocused(true);
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, [inputRef]);

  // baseNum은 input으로 전달받은 value
  // multiNum은 range input의 새로운 최대값을 구하기 위해서 곱해줄 숫자 (1, 2, 5. 10 중 하나를 전달받음)
  // baseNum의 자리수를 구하여 이를 10의 제곱 형태로 변형 -> 여기에 multiNum을 곱하여 새로운 최대값을 구함
  const getRangeMaxNumber = useCallback((baseNum: number, multiNum: number) => {
    const digit = (Math.floor(baseNum) + '').length;

    return (Math.pow(10, digit - 1) * multiNum).toString();
  }, []);

  // 숫자로 전달받은 Input value를 string으로 변환하여 맨 앞자리의 숫자를 판단,
  // 1, 2, 5라면 getRangeMaxNumber를 통해서 새로운 최대값을 구한 후 range input의 max attribute에 할당
  const handleMaxLimitLogic = useCallback(
    (num: number) => {
      const numToStrArray = (num + '').split('');

      if (+numToStrArray[0] > 5 && num > 10) {
        const getNewMax = getRangeMaxNumber(num, 10);

        if (num > +getNewMax) {
          return;
        } else {
          rangeRef.current!.max = getNewMax;
        }
      } else if (+numToStrArray[0] === 1 && num > 10) {
        const getNewMax = getRangeMaxNumber(num, 2);
        const compareNum = getRangeMaxNumber(num, 1);

        if (num > +getNewMax) {
          return;
        } else if (compareNum === num + '') {
          rangeRef.current!.max = num + '';
        } else {
          rangeRef.current!.max = getNewMax;
        }
      } else if (+numToStrArray[0] >= 2 && +numToStrArray[0] <= 5 && num > 10) {
        const getNewMax = getRangeMaxNumber(num, 5);
        const compareNum = getRangeMaxNumber(num, 2);

        if (num > +getNewMax) {
          rangeRef.current!.max = getRangeMaxNumber(num, 10);
        } else if (compareNum === num + '') {
          rangeRef.current!.max = num + '';
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
    [getRangeMaxNumber],
  );

  // range input이 change 될 때에 range input의 최대값을 변경하는 함수
  const setRangeMaxLimit = useCallback(
    (e: any) => {
      const num = parseFloat(e.target.value);

      if (limitMax) {
        if (num < limitMax) {
          handleMaxLimitLogic(num);
          setIsValueChanged(false);
          if (onChangeEnd) {
            onChangeEnd(num);
          }
        } else if (num >= limitMax) {
          handleMaxLimitLogic(limitMax);
          setIsValueChanged(false);
          if (onChangeEnd) {
            onChangeEnd(limitMax);
          }
        }
        return;
      }

      handleMaxLimitLogic(num);
      setIsValueChanged(false);
      if (onChangeEnd) {
        onChangeEnd(num);
      }
    },
    [handleMaxLimitLogic, onChangeEnd, limitMax],
  );

  // 부모 요소에서 currentValue를 전달받았을 경우, range input의 최대값을 변경하는 함수
  const setInputMaxLimit = useCallback(
    (currentValue: number) => {
      handleMaxLimitLogic(currentValue);
    },
    [handleMaxLimitLogic],
  );

  // 'Enter'키를 누를 경우 text input의 blur와 동일한 이벤트가 발생하도록 하는 함수
  const handleKeyboard = useCallback((e: any) => {
    if (e.key === 'Enter') {
      inputRef.current!.blur();
    }
  }, []);

  // input을 통한 value 변경이 아닌, model을 직접 움직여 값이 변경되는 경우 range input의 동기화를 위한 코드
  // range input이 이중으로 변환되는 것을 막기 위해 isValueChanged를 트리거로 사용
  useEffect(() => {
    if (rangeRef && (currentValue || currentValue === 0)) {
      if (!isValueChanged) {
        rangeRef.current!.value = currentValue + '';
        setInputMaxLimit(currentValue);
      }
    }
  }, [currentMax, currentValue, setInputMaxLimit, isValueChanged]);

  // input에 동일한 값을 다시 입력하려고 할 경우 변화를 감지할 수 있도록 isFocused를 트리거로 사용하여 소수점을 다시 적용
  useEffect(() => {
    if (!isFocused) {
      const decimalFixedValue = Number.parseFloat(currentValue + '').toFixed(decimalDigit ? decimalDigit : 1);

      inputRef.current!.value = decimalFixedValue;
    }
  }, [currentValue, decimalDigit, isFocused]);

  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={classes}>
      <p>{text}</p>
      <div className={cx('input-container', { able: activeStatus === undefined ? true : activeStatus })}>
        {/* slide를 통해서 값을 변경 할 수 있는 range input */}
        <input
          type="range"
          step={step}
          placeholder="0.0"
          min={0}
          max={currentMax}
          onChange={(e) => {
            setIsValueChanged(true);
            inputRef.current!.value = e.target.value;
            handleChange(e);
            setProgressBar((+rangeRef.current!.value * 100) / +rangeRef.current!.max);
          }}
          onMouseUp={setRangeMaxLimit}
          ref={rangeRef}
          tabIndex={activeStatus ? 0 : -1}
          style={{ backgroundSize: rangeRef.current ? `${progressBar}% 100%` : `100% 100%` }}
        />
        {/* 직접 값을 입력할 수 있는 text input */}
        <input
          type="number"
          step={step}
          placeholder="0.0"
          onFocus={handleSelectText}
          onKeyUp={handleKeyboard}
          onBlur={(e) => {
            if (limitMax && parseFloat(e.target.value) > limitMax) {
              setRangeMaxLimit(e);
              rangeRef.current!.value = limitMax.toString();
              inputRef.current!.value = limitMax.toString();
              handleChange(e);
              setProgressBar((+rangeRef.current!.value * 100) / +rangeRef.current!.max);
              setIsFocused(false);
              return;
            }
            setRangeMaxLimit(e);
            rangeRef.current!.value = e.target.value;
            handleChange(e);
            setProgressBar((+rangeRef.current!.value * 100) / +rangeRef.current!.max);
            setIsFocused(false);
          }}
          ref={inputRef}
          tabIndex={activeStatus ? 0 : -1}
          defaultValue={currentMax}
        />
        {/* 비활성화 시 해당 input들에 접근이 불가능하게 하는 overlay div */}
        {!activeStatus && <div className={cx('input-inactive-overlay')}>{inactiveMessage ?? DEFAULT_INACTIVE_MESSAGE}</div>}
      </div>
    </div>
  );
};

export default AnimationRangeInput;
