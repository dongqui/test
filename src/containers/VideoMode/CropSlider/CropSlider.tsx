/* eslint-disable react-hooks/exhaustive-deps */
import { ReactNode, FunctionComponent, Fragment, useState, useRef, useCallback, useEffect, ChangeEvent, Dispatch, SetStateAction, RefObject } from 'react';
import classNames from 'classnames/bind';
import styles from './CropSlider.module.scss';

const cx = classNames.bind(styles);

interface Props {
  start: number;
  end: number;
  duration: number;
  currentVideoTime: number;
  indicatorPosition: number;
  isIndicatorClicked: boolean;
  handleTimeline: (e: any) => void;
  handleMouseDown: (e: any) => void;
  handleMouseUp: (e: any) => void;
  handleMouseMove: (e: any, parentNodeWidth: number) => void;
  videoRef: RefObject<HTMLVideoElement>;
  thumbnailWrapRef: RefObject<HTMLDivElement>;
  onChange: Function;
  children: ReactNode;
}

export const CropSlider: FunctionComponent<Props> = ({
  start,
  end,
  duration,
  currentVideoTime,
  indicatorPosition,
  isIndicatorClicked,
  handleTimeline,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  videoRef,
  thumbnailWrapRef,
  onChange,
  children,
}) => {
  const [startValue, setStartValue] = useState(start);
  const [endValue, setEndValue] = useState(end);

  const cropRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const startRef = useRef(start);
  const endRef = useRef(end);

  const getPercent = useCallback(
    (value: number) => {
      return Math.round(((value - start) / (end - start)) * 1000) / 10;
    },
    [start, end],
  );

  const handleSlider = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.id === 'left') {
      const value = Math.min(Number(event.target.value), endValue - 1);
      startRef.current = value;
      setStartValue(value);
      if (videoRef.current!.currentTime <= Math.round(((duration * 100) / 100) * value) / 100) {
        videoRef.current!.currentTime = Math.round(((duration * 100) / 100) * value) / 100;
      }
    } else {
      const value = Math.max(Number(event.target.value), startValue + 1);
      endRef.current = value;
      setEndValue(value);
      if (videoRef.current!.currentTime >= Math.round(((duration * 100) / 100) * value) / 100) {
        videoRef.current!.currentTime = Math.round(((duration * 100) / 100) * value) / 100;
      }
    }
  };

  const handlePreventEvent = useCallback((e) => {
    e.preventDefault();
  }, []);

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

  useEffect(() => {
    indicatorRef.current!.style.left = indicatorPosition + '%';
  }, [indicatorPosition]);

  return (
    <Fragment>
      <input id="left" type="range" min={start} max={end} step={0.001} value={startValue} onChange={handleSlider} className={cx('thumb', 'thumb-left')} />
      <input id="right" type="range" min={start} max={end} step={0.001} value={endValue} onChange={handleSlider} className={cx('thumb', 'thumb-right')} />
      <div className={cx('slider')}>
        <div className={cx('slider-track')}></div>
        <div ref={cropRef} className={cx('slider-range')}></div>
        <span
          className={cx('slider-time-indicator', 'no-select')}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            if (isIndicatorClicked) {
              handleMouseMove(e, thumbnailWrapRef.current!.getBoundingClientRect().width);
            }
          }}
          onMouseUp={handleMouseUp}
          ref={indicatorRef}
        >
          {Math.round(currentVideoTime * 10) / 10}
        </span>
        {children}
      </div>
      <input
        className={cx('slider-time', 'no-select')}
        id="scrubber"
        type="range"
        min="0"
        max={duration}
        step="0.01"
        value={currentVideoTime}
        onChange={handleTimeline}
        onKeyDown={handlePreventEvent}
      />
    </Fragment>
  );
};
