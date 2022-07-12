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
  dropzoneDisabled?: boolean;
  startValue: number;
  endValue: number;
  onChangeStart: (value: number) => void;
  onChangeEnd: (value: number) => void;
}

const TimelinePanel = ({ videoRef, timeline, isVideoLoaded, videoStatus, duration, onDrop, startValue, endValue, onChangeStart, onChangeEnd, dropzoneDisabled = false }: Props) => {
  const rulerRef = useRef<HTMLInputElement>(null);
  const [number, setNumber] = useState(0);
  const [originNumber, setOriginNumber] = useState(0);
  const [rulerValues, setRulerValues] = useState<number[]>([]);

  useEffect(() => {
    if (duration) {
      setRulerValues(Array.from([0, 1, 2, 3, 4, 5], (x) => Math.round((x * duration) / 5)));
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

  useEffect(() => {
    const resetSliderStyles = () => {
      setSliderStyles({
        left: 0,
        right: 100,
        width: 100,
      });
    };

    if (isVideoLoaded) {
      resetSliderStyles();
    }
  }, [isVideoLoaded]);

  const handleChangeCurrentTime = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (timeline && videoRef.current) {
        let targetValue = Number(event.target.value);
        if (targetValue > endValue) {
          targetValue = endValue;
        }
        if (targetValue < startValue) {
          targetValue = startValue;
        }

        videoRef.current.currentTime = targetValue;
        const value = Number((targetValue * 100) / duration);
        setNumber(value);
        setOriginNumber(targetValue);
      }
    },
    [duration, endValue, startValue, timeline, videoRef],
  );

  const handleChangeStartValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number((Number(event.target.value) * 100) / duration);

      if (Number(event.target.value) < endValue - 1) {
        onChangeStart(Number(event.target.value));
        setSliderStyles({
          left: value,
          right: sliderStyles.right,
          width: sliderStyles.width - (value - sliderStyles.left),
        });

        if (videoRef.current && Number(event.target.value) > videoRef.current.currentTime) {
          videoRef.current.currentTime = Number(event.target.value);
          setNumber(value);
          setOriginNumber(Number(event.target.value));
        }
      }
    },
    [duration, endValue, onChangeStart, sliderStyles.left, sliderStyles.right, sliderStyles.width, videoRef],
  );

  const handleChangeEndValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number((Number(event.target.value) * 100) / duration);

      if (Number(event.target.value) > startValue + 1) {
        onChangeEnd(Number(event.target.value));
        setSliderStyles({
          left: sliderStyles.left,
          right: value,
          width: sliderStyles.width - (sliderStyles.right - value),
        });

        if (videoRef.current && Number(event.target.value) < videoRef.current.currentTime) {
          videoRef.current.currentTime = Number(event.target.value);
          setNumber(value);
          setOriginNumber(Number(event.target.value));
        }
      }
    },
    [duration, onChangeEnd, sliderStyles.left, sliderStyles.right, sliderStyles.width, startValue, videoRef],
  );

  const requestRef = useRef(0);
  const originRulerRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.currentTime > endValue || videoRef.current.currentTime < startValue) {
        videoRef.current.currentTime = startValue;
      }

      const value = Number((Number(videoRef.current.currentTime) * 100) / duration);
      setNumber(value);

      requestRef.current = requestAnimationFrame(handleChange);
    }
  }, [duration, endValue, startValue, videoRef]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(handleChange);
    // if (isPlaying) {
    //   requestRef.current = requestAnimationFrame(changeIndicatorPosition);
    // }

    if (videoStatus !== 'play') {
      cancelAnimationFrame(requestRef.current);
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [handleChange, videoRef, videoStatus]);

  useEffect(() => {
    // on pause, stop recalculate scrubber position
    if (videoRef.current && videoStatus !== 'play') {
      const value = Number((videoRef.current.currentTime * 100) / duration);
      setNumber(value);
      setOriginNumber(videoRef.current.currentTime);
    }
  }, [duration, videoRef, videoStatus]);

  return (
    <Fragment>
      <div className={cx('wrapper', { hidden: !isVideoLoaded })}>
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
            <label className={cx('indicator-value')} id="currentTime" style={{ left: `${number}%`, transform: `translate(calc(-50% + 16px * (100 - ${number * 2}) / 100), -50%)` }}>
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
      </div>
      <div className={cx('dropzone', { hidden: isVideoLoaded })}>
        <BaseDropzone disabled={dropzoneDisabled} onDrop={onDrop} className={cx('dropzone-outer')} active={cx('dropzone-active')}>
          {({ open }) => (
            <div className={cx('dropzone-guide')} onClick={open}>
              <IconWrapper className={cx('icon-plus')} icon={SvgPath.Plus} />
              <div className={cx('dropzone-guide-text')}>
                Drag and drop <br />
                or
              </div>
              <OutlineButton disabled={dropzoneDisabled}>Browse File</OutlineButton>
            </div>
          )}
        </BaseDropzone>
      </div>
    </Fragment>
  );
};

export default TimelinePanel;
