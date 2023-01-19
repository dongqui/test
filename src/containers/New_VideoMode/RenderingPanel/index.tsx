import { useRef, RefObject, Fragment } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  isVideoLoaded: boolean;
  onLoadMetadata: () => void;
  isWithoutCamera?: boolean;
  standByCount?: number;
  cancelCountdown: () => void;
  onVideoLoaded: () => void;
}

const RenderingPanel = ({ videoRef, isVideoLoaded, onLoadMetadata, isWithoutCamera = true, standByCount, cancelCountdown, onVideoLoaded }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const classes = cx('video', {
    mirror: !isVideoLoaded,
  });

  return (
    <Fragment>
      <canvas className={cx('timeline-generator')} ref={canvasRef} />
      <video ref={videoRef} className={classes} onLoadedMetadata={onLoadMetadata} autoPlay playsInline muted loop={isVideoLoaded} onLoadedData={onVideoLoaded} />
      {isWithoutCamera && (
        <div className={cx('notification')}>
          <IconWrapper className={cx('icon')} icon={SvgPath.NoCamera} />
          <div className={cx('text')}>There is no connected camera.</div>
        </div>
      )}
      {standByCount !== undefined && (
        <div onClick={cancelCountdown} className={cx('counter')}>
          <span>{standByCount}</span>
        </div>
      )}
    </Fragment>
  );
};

export default RenderingPanel;
