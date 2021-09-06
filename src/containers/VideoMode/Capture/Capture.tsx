import { Fragment, useRef, useEffect } from 'react';
import { UpperBar } from 'containers/UpperBar';
import { IconWrapper, SvgPath } from 'components/Icon';
import { Dropdown } from 'components/Dropdown';
import Box, { BoxProps } from 'components/Layout/Box';
import classNames from 'classnames/bind';
import styles from './Capture.module.scss';

const cx = classNames.bind(styles);

export const Capture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLCanvasElement>(null);
  const videoOptions = {
    autoPlay: true,
    playsInline: true,
    muted: true,
  };
  const boxProps = {
    up: {
      height: 36,
    } as BoxProps,
    mb: {
      height: 32,
    } as BoxProps,
    tp: {
      height: 132,
    } as BoxProps,
  };
  const handleCameraSelect = () => {
    console.log('카메라 선택');
  };
  const availableCamera = [
    {
      key: 'Camera1',
      value: 'Camera 1',
      isSelected: true,
    },
  ];
  const playBox = [
    { icon: SvgPath.Record },
    { icon: SvgPath.RewindArrow },
    { icon: SvgPath.PlayArrow },
    { icon: SvgPath.Stop },
  ];
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current!.srcObject = stream;
    });
  }, []);
  return (
    <Fragment>
      <Box id="UP" {...boxProps.up}>
        <UpperBar sceneName="Please enter a scene name" />
      </Box>
      <div className={cx('video-wrap')}>
        <video ref={videoRef} className={cx('webcam')} {...videoOptions} />
      </div>
      <Box id="MP" {...boxProps.mb}>
        <div className={cx('middle-bar')}>
          <div className={cx('playbox')}>
            {playBox.map((item, index) => (
              <IconWrapper key={index} className={cx('icon')} icon={item.icon} />
            ))}
          </div>
          <Dropdown list={availableCamera} onSelect={handleCameraSelect} fixed />
        </div>
      </Box>
      {/* Ruler가 추가되어야 할 부분 */}
      <div className={cx('ruler')} />
      {/* video-thumbnail, 생성된 이미지는 캔버스로 배치 */}
      <div className={cx('thumbnail-wrap')}>
        <div className={cx('thumbnail')}>
          <canvas ref={frameRef} />
        </div>
      </div>
    </Fragment>
  );
};
