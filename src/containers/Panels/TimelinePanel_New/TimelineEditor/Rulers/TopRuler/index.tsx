import { useCallback, useState, FunctionComponent, RefObject, useRef } from 'react';
import StartEndInput from './StartEndInput';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  topRulerRef: RefObject<SVGGElement>;
}

const TopRuler: FunctionComponent<Props> = ({ topRulerRef }) => {
  const [startValue, setStartValue] = useState<number | string>(0); // 공백을 입력하면 ""이 되기 때문에 string type 필요
  const [endValue, setEndValue] = useState<number | string>(500); // 공백을 입력하면 ""이 되기 때문에 string type 필요
  const previousStartValue = useRef(0);
  const previousEndValue = useRef(500);

  // start input blur 이벤트 동작
  const handleStartInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const nextStartValue = parseInt(event.target.value);
      const isMinusZero = Object.is(-0, nextStartValue);
      if (isNaN(nextStartValue) || nextStartValue < 0 || endValue <= nextStartValue) {
        return setStartValue(previousStartValue.current);
      }
      if (isMinusZero) {
        event.target.value = '0';
        return setStartValue(0);
      }
      setStartValue(nextStartValue);
      previousStartValue.current = nextStartValue;
    },
    [endValue],
  );

  // end input blur 이벤트 동작
  const handleEndInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const nextEndValue = parseInt(event.target.value);
      if (isNaN(nextEndValue) || nextEndValue <= startValue) {
        return setEndValue(previousEndValue.current);
      }
      setStartValue(nextEndValue);
      previousEndValue.current = nextEndValue;
    },
    [startValue],
  );

  // start input value 업데이트
  const handleStartInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setStartValue(event.target.value);
  }, []);

  // end input value 업데이트
  const handleEndInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEndValue(event.target.value);
  }, []);

  return (
    <g>
      <rect className={cx('ruler-width')} />
      <g ref={topRulerRef} className={cx('top-ruler')}>
        {/* d3를 통해 눈금, grid line이 들어가는 영역 */}
      </g>
      <StartEndInput
        onBlur={handleStartInputBlur}
        onChange={handleStartInputChange}
        value={startValue}
      />
      <StartEndInput
        endInput
        onBlur={handleEndInputBlur}
        onChange={handleEndInputChange}
        value={endValue}
      />
    </g>
  );
};

export default TopRuler;
