/* eslint-disable react-hooks/exhaustive-deps */
import {
  ReactNode,
  FunctionComponent,
  Fragment,
  useState,
  useRef,
  useCallback,
  useEffect,
  ChangeEvent,
} from 'react';
import classNames from 'classnames/bind';
import styles from './CropSlider.module.scss';

const cx = classNames.bind(styles);

interface Props {
  start: number;
  end: number;
  duration: number;
  currentVideoTime: number;
  handleTimeline: (e: any) => void;
  onChange: Function;
  children: ReactNode;
}

export const CropSlider: FunctionComponent<Props> = ({
  start,
  end,
  duration,
  currentVideoTime,
  handleTimeline,
  onChange,
  children,
}) => {
  const [startValue, setStartValue] = useState(start);
  const [endValue, setEndValue] = useState(end);

  const cropRef = useRef<HTMLDivElement>(null);
  const startRef = useRef(start);
  const endRef = useRef(end);

  const getPercent = useCallback(
    (value: number) => Math.round(((value - start) / (end - start)) * 100),
    [start, end],
  );

  const handleSlider = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === 'left') {
      const value = Math.min(Number(event.target.value), endValue - 1);
      startRef.current = value;
      setStartValue(value);
    } else {
      const value = Math.max(Number(event.target.value), startValue + 1);
      endRef.current = value;
      setEndValue(value);
    }
  };

  let min = getPercent(startRef.current);
  let max = getPercent(endRef.current);

  useEffect(() => {
    if (cropRef.current) {
      cropRef.current.style.left = `${min}%`;
      cropRef.current.style.width = `${max - min}%`;
    }
  }, [startRef.current]);

  useEffect(() => {
    if (cropRef.current) {
      cropRef.current.style.width = `${max - min}%`;
    }
  }, [endRef.current]);

  useEffect(() => {
    onChange({ start: startValue, end: endValue });
  }, [startValue, endValue, onChange]);

  return (
    <Fragment>
      <input
        id="left"
        type="range"
        min={start}
        max={end}
        step={0.1}
        value={startValue}
        onChange={handleSlider}
        className={cx('thumb', 'thumb-left')}
      />
      <input
        id="right"
        type="range"
        min={start}
        max={end}
        step={0.1}
        value={endValue}
        onChange={handleSlider}
        className={cx('thumb', 'thumb-right')}
      />
      <div className={cx('slider')}>
        <div className={cx('slider-track')}></div>
        <div ref={cropRef} className={cx('slider-range')}></div>
        <input
          className={cx('slider-time')}
          type="range"
          min="0"
          max={duration}
          step="0.01"
          value={currentVideoTime}
          onChange={handleTimeline}
        />
        {children}
      </div>
    </Fragment>
  );
};
