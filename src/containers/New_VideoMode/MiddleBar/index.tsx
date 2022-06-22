import { Fragment, RefObject, useCallback, useState } from 'react';
import { SvgPath } from 'components/Icon';
import { IconButton } from 'components/Button';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  videoStatus: 'stop' | 'play' | 'pause';
  onChange: (status: 'stop' | 'play' | 'pause') => void;
  onRecord: () => void;
  onRecordStop: () => void;
  hasVideo: boolean;
  recordAvailable: boolean;
  isRecording: boolean;
}

const MiddleBar = ({ videoRef, videoStatus, onChange, onRecord, hasVideo, recordAvailable, isRecording, onRecordStop }: Props) => {
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
      videoRef.current.currentTime = 0;
      onChange('stop');
    }
  }, [onChange, videoRef]);

  const handleRecord = useCallback(() => {
    if (videoRef.current) {
      onRecord();
    }
  }, [onRecord, videoRef]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')}>
        <div className={cx('button-group')}>
          {isRecording ? (
            <IconButton icon={SvgPath.CameraStop} type="negative" onClick={onRecordStop} />
          ) : (
            <IconButton disabled={!recordAvailable} icon={SvgPath.CameraRecord} type="negative" onClick={handleRecord} />
          )}
          {hasVideo && (
            <Fragment>
              {videoStatus === 'play' ? (
                <IconButton icon={SvgPath.CameraPause} type="ghost" onClick={handlePause} />
              ) : (
                <IconButton icon={SvgPath.CameraPlay} type="ghost" onClick={handlePlay} />
              )}
              <IconButton icon={SvgPath.CameraStop} type="ghost" onClick={handleStop} />
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiddleBar;
