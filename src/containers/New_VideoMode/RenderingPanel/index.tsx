import { useState, useRef, RefObject, Fragment } from 'react';
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
}

const RenderingPanel = ({ videoRef, isVideoLoaded, onLoadMetadata, isWithoutCamera = true, standByCount }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // mirror: videoRef.current && !videoRef.current.src,
  const classes = cx('video', {
    mirror: isVideoLoaded,
  });

  return (
    <Fragment>
      <canvas className={cx('timeline-generator')} ref={canvasRef} />
      <video ref={videoRef} className={classes} onLoadedMetadata={onLoadMetadata} autoPlay playsInline muted loop={isVideoLoaded} />
      {isWithoutCamera && (
        <div className={cx('notification')}>
          <IconWrapper className={cx('icon')} icon={SvgPath.NoCamera} />
          <div className={cx('text')}>There is no connected camera.</div>
        </div>
      )}
      {standByCount !== undefined && <div className={cx('counter')}>{standByCount}</div>}
    </Fragment>
  );
};

export default RenderingPanel;
