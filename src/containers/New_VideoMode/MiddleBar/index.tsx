import { Fragment, RefObject, useCallback, FocusEvent, useEffect } from 'react';
import { SvgPath } from 'components/Icon';
import { IconButton } from 'components/Button';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  videoStatus: 'stop' | 'play' | 'pause';
  isVideoLoaded: boolean;
  onChange: (status: 'stop' | 'play' | 'pause') => void;
  onRecord: () => void;
  onRecordStop: () => void;
  isRecording: boolean;
  isCountdown: boolean;
  switchStandbyMode: () => void;
  startValue: number;
  recordButtonRef: (ref: HTMLButtonElement | null) => void;
  doneVMOnBoarding: (index: number) => void;
}

const MiddleBar = ({
  videoRef,
  recordButtonRef,
  videoStatus,
  onChange,
  isVideoLoaded,
  onRecord,
  isCountdown,
  isRecording,
  onRecordStop,
  switchStandbyMode,
  startValue,
  doneVMOnBoarding,
}: Props) => {
  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      onChange('play');
    }
  }, [onChange, videoRef]);

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      onChange('pause');
    }
  }, [onChange, videoRef]);

  const handleStop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = startValue;
      onChange('pause');
      setTimeout(() => onChange('stop'), 50);
    }
  }, [onChange, startValue, videoRef]);

  const handleRecord = useCallback(() => {
    if (videoRef.current) {
      onRecord();
      doneVMOnBoarding(1);
    }
  }, [doneVMOnBoarding, onRecord, videoRef]);

  const blurFocused = useCallback((e: FocusEvent<HTMLButtonElement>) => e.target.blur(), []);

  const renderButtonGroup = useCallback(() => {
    if (isVideoLoaded) {
      const isVideoPlaying = videoStatus === 'play';

      if (isVideoPlaying) {
        return (
          <Fragment>
            <div className={cx('button-group')}>
              <IconButton icon={SvgPath.CameraRecord} type="negative" onClick={switchStandbyMode} onFocus={blurFocused} />
            </div>
            <div className={cx('button-group')}>
              <IconButton icon={SvgPath.CameraPause} type="ghost" onClick={handlePause} onFocus={blurFocused} />
              <IconButton icon={SvgPath.CameraStop} type="ghost" onClick={handleStop} onFocus={blurFocused} />
            </div>
          </Fragment>
        );
      }

      return (
        <Fragment>
          <div className={cx('button-group')}>
            <IconButton icon={SvgPath.CameraRecord} type="negative" onClick={switchStandbyMode} onFocus={blurFocused} />
          </div>
          <div className={cx('button-group')}>
            <IconButton icon={SvgPath.CameraPlay} type="ghost" onClick={handlePlay} onFocus={blurFocused} />
            <IconButton icon={SvgPath.CameraStop} type="ghost" onClick={handleStop} onFocus={blurFocused} />
          </div>
        </Fragment>
      );
    }

    return isRecording ? (
      <IconButton icon={SvgPath.CameraStop} type="negative" onClick={onRecordStop} onFocus={blurFocused} />
    ) : (
      <IconButton r={recordButtonRef} disabled={isCountdown} icon={SvgPath.CameraRecord} type="negative" onClick={handleRecord} onFocus={blurFocused} />
    );
  }, [blurFocused, handlePause, handlePlay, handleRecord, handleStop, isCountdown, isRecording, isVideoLoaded, onRecordStop, recordButtonRef, switchStandbyMode, videoStatus]);

  useEffect(() => {
    if (isVideoLoaded) {
      recordButtonRef(null);
    }
  }, [isVideoLoaded, recordButtonRef]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')}>
        <div className={cx('button-group-wrapper')}>{renderButtonGroup()}</div>
      </div>
    </div>
  );
};

export default MiddleBar;
