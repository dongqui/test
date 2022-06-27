import { Fragment, RefObject, useRef, useCallback, useState, ChangeEvent, useEffect } from 'react';
import { Timeline } from '@babylonjs/controls';
import { BaseDropzone } from 'components/Input/Dropzone';
import { OutlineButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  timeline?: Timeline;
  isVideoLoaded: boolean;
  videoStatus: 'stop' | 'play' | 'pause';
  duration: number;
  onDrop: (files: File[]) => Promise<void>;
}

const TimelinePanel = ({ videoRef, timeline, isVideoLoaded, videoStatus, duration, onDrop }: Props) => {
  const rulerRef = useRef<HTMLInputElement>(null);
  const [number, setNumber] = useState(0);
  const [originNumber, setOriginNumber] = useState(0);
  const [rulerValues, setRulerValues] = useState<number[]>([]);
  const [startValue, setStartValue] = useState(0);
  const [endValue, setEndValue] = useState(duration);

  useEffect(() => {
    if (duration) {
      setRulerValues(Array.from([0, 1, 2, 3, 4, 5], (x) => Math.round((x * duration) / 5)));
      setEndValue(duration);
    }
  }, [duration]);

  const [sliderStyles, setSliderStyles] = useState<{
    left: number;
    right: number;
    width: number;
  }>({
    left: 0,
    right: 100,
    width: 100,
  });

  const handleChangeCurrentTime = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (timeline && videoRef.current) {
        videoRef.current.currentTime = Number(event.target.value);
        const value = Number(((Number(event.target.value) - 0) * 100) / (duration - 0));
        setNumber(value);
        setOriginNumber(Number(event.target.value));
      }
    },
    [duration, timeline, videoRef],
  );

  const handleChangeStartValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(((Number(event.target.value) - 0) * 100) / (duration - 0));

      if (Number(event.target.value) < endValue - 1) {
        setStartValue(Number(event.target.value));
        setSliderStyles({
          left: value,
          right: sliderStyles.right,
          width: sliderStyles.width - (value - sliderStyles.left),
        });
      }
    },
    [duration, endValue, sliderStyles.left, sliderStyles.right, sliderStyles.width],
  );

  const handleChangeEndValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(((Number(event.target.value) - 0) * 100) / (duration - 0));

      if (Number(event.target.value) > startValue + 1) {
        setEndValue(Number(event.target.value));
        setSliderStyles({
          left: sliderStyles.left,
          right: value,
          width: sliderStyles.width - (sliderStyles.right - value),
        });
      }
    },
    [duration, sliderStyles.left, sliderStyles.right, sliderStyles.width, startValue],
  );

  const requestRef = useRef(0);
  const originRulerRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(() => {
    if (videoRef.current) {
      const value = Number(((Number(videoRef.current.currentTime) - 0) * 100) / (duration - 0));
      setNumber(value);

      requestRef.current = requestAnimationFrame(handleChange);
    }
  }, [duration, videoRef]);

  // const changeIndicatorPosition = useCallback(() => {
  //   if (rulerRef.current) {
  //     const value = Number(((Number(rulerRef.current.value) - 0) * 100) / (duration - 0));
  //
  //     setNumber(value);
  //     requestRef.current = requestAnimationFrame(changeIndicatorPosition);
  //   }
  // }, [duration]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(handleChange);
    // if (isPlaying) {
    //   requestRef.current = requestAnimationFrame(changeIndicatorPosition);
    // }

    if (videoStatus !== 'play') {
      cancelAnimationFrame(requestRef.current);
    }

    if (videoRef.current) {
      if (videoRef.current.currentTime === 0 && videoStatus !== 'play') {
        setNumber(0);
      }
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [handleChange, videoRef, videoStatus]);

  return (
    <Fragment>
      {isVideoLoaded ? (
        <Fragment>
          <div className={cx('ruler')}>
            <div className={cx('indicator-wrapper')}>
              <input ref={originRulerRef} style={{ display: 'none' }} value={originNumber} onChange={handleChange} />
              <input
                ref={rulerRef}
                className={cx('indicator')}
                type="range"
                id="currentTime"
                min={0}
                max={duration}
                step="0.001"
                value={videoRef.current?.currentTime}
                onChange={handleChangeCurrentTime}
              />
              <label
                className={cx('indicator-value')}
                id="currentTime"
                style={{ left: `${number}%`, transform: `translate(calc(-50% + 16px * (100 - ${number * 2}) / 100), -50%)` }}
              >
                {((duration * Number(number.toFixed(1))) / 100).toFixed(1)}
                <div className={cx('indicator-line')} />
              </label>
            </div>
            <div className={cx('ruler-inner')}>
              {rulerValues.map((value, index) => (
                <div key={`a${value}.${index}`}>{value}s</div>
              ))}
            </div>
          </div>
          <div className={cx('timeline-wrapper')}>
            <div className={cx('timeline')}>
              <canvas id="timelineCanvas" className={cx('timeline-canvas')} />
              <input className={cx('scrubber')} type="range" min={0} max={duration} step="0.001" value={videoRef.current?.currentTime} onChange={handleChangeCurrentTime} />
              <input className={cx('crop-slider-start')} type="range" min={0} max={duration} step="0.001" value={startValue} onChange={handleChangeStartValue} />
              <input className={cx('crop-slider-end')} type="range" min={0} max={duration} step="0.001" value={endValue} onChange={handleChangeEndValue} />
              <div className={cx('slider-time')} style={{ left: `calc(${sliderStyles.left}%)`, width: `calc(${sliderStyles.width}%)` }} />
            </div>
          </div>
        </Fragment>
      ) : (
        <div className={cx('dropzone')}>
          <BaseDropzone onDrop={onDrop} className={cx('dropzone-outer')} active={cx('dropzone-active')}>
            {({ open }) => (
              <div className={cx('dropzone-guide')}>
                <IconWrapper className={cx('icon-plus')} icon={SvgPath.Plus} />
                <div className={cx('dropzone-guide-text')}>
                  Drag and drop <br />
                  or
                </div>
                <OutlineButton onClick={open}>Browse File</OutlineButton>
              </div>
            )}
          </BaseDropzone>
        </div>
      )}
    </Fragment>
  );
};

export default TimelinePanel;
