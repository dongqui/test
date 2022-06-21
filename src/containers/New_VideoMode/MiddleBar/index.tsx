import { RefObject, useCallback, useState } from 'react';
import { SvgPath } from 'components/Icon';
import { IconButton } from 'components/Button';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
}

const MiddleBar = ({ videoRef }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [videoRef]);

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [videoRef]);

  const handleStop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [videoRef]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('inner')}>
        <div className={cx('button-group')}>
          <IconButton icon={SvgPath.CameraRecord} type="negative" />
          {isPlaying ? <IconButton icon={SvgPath.CameraPause} type="ghost" onClick={handlePause} /> : <IconButton icon={SvgPath.CameraPlay} type="ghost" onClick={handlePlay} />}
          <IconButton icon={SvgPath.CameraStop} type="ghost" onClick={handleStop} />
        </div>
      </div>
    </div>
  );
};

export default MiddleBar;
