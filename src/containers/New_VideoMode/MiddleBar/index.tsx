import { Fragment, RefObject, useCallback } from 'react';
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
}

const MiddleBar = ({ videoRef, videoStatus, isVideoLoaded, onChange }: Props) => {
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

  const renderButtonGroup = useCallback(() => {
    if (isVideoLoaded) {
      const isVideoPlaying = videoStatus === 'play';

      if (isVideoPlaying) {
        return (
          <Fragment>
            <IconButton icon={SvgPath.CameraRecord} type="negative" />
            <IconButton icon={SvgPath.CameraPause} type="ghost" onClick={handlePause} />
            <IconButton icon={SvgPath.CameraStop} type="ghost" onClick={handleStop} />
          </Fragment>
        );
      }

      return (
        <Fragment>
          <IconButton icon={SvgPath.CameraRecord} type="negative" />
          <IconButton icon={SvgPath.CameraPlay} type="ghost" onClick={handlePlay} />
          <IconButton icon={SvgPath.CameraStop} type="ghost" onClick={handleStop} />
        </Fragment>
      );
    }

    return <IconButton icon={SvgPath.CameraRecord} type="negative" />;
  }, [handlePause, handlePlay, handleStop, isVideoLoaded, videoStatus]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')}>
        <div className={cx('button-group')}>{renderButtonGroup()}</div>
      </div>
    </div>
  );
};

export default MiddleBar;
