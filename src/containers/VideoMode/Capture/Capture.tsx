/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useRef, useEffect } from 'react';
import { UpperBar } from 'containers/UpperBar';
import { FilledButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { CropSlider } from '../CropSlider';
import { VMRuler } from '../VMRuler';
import Box, { BoxProps } from 'components/Layout/Box';
import { useMediaStream } from 'hooks/common';
import classNames from 'classnames/bind';
import styles from './Capture.module.scss';

const cx = classNames.bind(styles);

export const Capture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLCanvasElement>(null);

  const { mediaStreamInitialize } = useMediaStream({
    ref: videoRef,
  });

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

  const playBox = [
    { icon: SvgPath.Record },
    { icon: SvgPath.RewindArrow },
    { icon: SvgPath.PlayArrow },
    { icon: SvgPath.Stop },
  ];

  const handleSlider = (start: number, end: number) => {
    console.log(start, end);
  };

  useEffect(() => {
    mediaStreamInitialize();
  }, []);
  return (
    <Fragment>
      <Box id="UP" {...boxProps.up}>
        <UpperBar sceneName="Please enter a scene name" />
      </Box>
      <div className={cx('video-wrap')}>
        <video ref={videoRef} className={cx('video')} {...videoOptions}>
          <source id="mp4" src="http://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" />
        </video>
      </div>
      <Box id="MP" {...boxProps.mb}>
        <div className={cx('middle-bar')}>
          <div className={cx('playbox')}>
            {playBox.map((item, index) => (
              <IconWrapper key={index} className={cx('icon')} icon={item.icon} />
            ))}
          </div>
          <FilledButton className={cx('extract-button')} text="Extract Motion" />
        </div>
      </Box>
      <VMRuler start={0} end={100} />
      <div className={cx('thumbnail-wrap')}>
        <CropSlider start={0} end={100} onChange={handleSlider}>
          <div className={cx('thumbnail')}>
            <canvas ref={frameRef} />
          </div>
        </CropSlider>
      </div>
    </Fragment>
  );
};
