/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useState, useCallback, useRef, useEffect } from 'react';
import { UpperBar } from 'containers/UpperBar';
import { FilledButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { CropSlider } from '../CropSlider';
import { VMRuler } from '../VMRuler';
import Box, { BoxProps } from 'components/Layout/Box';
import { useMediaStream } from 'hooks/common';
import Image from 'next/image';
import classNames from 'classnames/bind';
import styles from './Capture.module.scss';
import { FunctionComponent } from 'hoist-non-react-statics/node_modules/@types/react';
import { is } from 'immer/dist/internal';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
}

export const VideoMode: FunctionComponent<Props> = ({ browserType }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailList, setThumbnailList] = useState([]);
  const [duration, setDuration] = useState<number>(0);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [playState, setPlayState] = useState<boolean>(false);

  const {
    mediaStreamInitialize,
    availableDevices,
    startRecording,
    stopRecording,
    playRecording,
    pauseRecording,
  } = useMediaStream({
    ref: videoRef,
    canvasRef: canvasRef,
    setThumbnailList: setThumbnailList,
    setDuration: setDuration,
    setPlayState: setPlayState,
    browserType: browserType,
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
    { id: 'startRecording', icon: SvgPath.Record, fn: startRecording },
    { id: 'rewindRecording', icon: SvgPath.RewindArrow, fn: availableDevices },
    { id: 'playRecording', icon: SvgPath.PlayArrow, fn: playRecording },
    { id: 'pauseRecording', icon: SvgPath.PauseVideo, fn: pauseRecording },
    { id: 'stopRecording', icon: SvgPath.Stop, fn: stopRecording },
  ];

  const handleVideoEnd = useCallback(() => {
    setPlayState(false);
  }, []);

  const handleSlider = (start: number, end: number) => {
    console.log(start, end);
  };

  const handleTimeline = useCallback((e) => {
    videoRef.current!.currentTime = e.target.value;
  }, []);

  const handleCurrentTime = useCallback(() => {
    setCurrentVideoTime(videoRef.current!.currentTime);
  }, []);

  useEffect(() => {
    mediaStreamInitialize();
  }, []);

  return (
    <Fragment>
      <Box id="UP" {...boxProps.up}>
        <UpperBar sceneName="Please enter a scene name" />
      </Box>
      <div className={cx('video-wrap')}>
        <canvas className={cx('thumbnail-canvas')} ref={canvasRef}></canvas>
        <video
          ref={videoRef}
          className={cx('video')}
          {...videoOptions}
          onTimeUpdate={handleCurrentTime}
          onEnded={handleVideoEnd}
        >
          <source id="mp4" src="http://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" />
        </video>
      </div>
      <Box id="MP" {...boxProps.mb}>
        <div className={cx('middle-bar')}>
          <div className={cx('playbox')}>
            {playBox.map((item, index) => {
              if (!playState && item.id === 'pauseRecording') {
                return;
              }

              if (playState && item.id === 'playRecording') {
                return;
              }

              return (
                <IconWrapper
                  key={index}
                  className={cx('icon', item.id)}
                  icon={item.icon}
                  onClick={item.fn}
                />
              );
            })}
          </div>
          <FilledButton className={cx('extract-button')} text="Extract Motion" />
        </div>
      </Box>
      <VMRuler start={0} end={100} />
      <div className={cx('thumbnail-wrap')}>
        <CropSlider
          start={0}
          end={100}
          duration={duration}
          currentVideoTime={currentVideoTime}
          handleTimeline={handleTimeline}
          onChange={handleSlider}
        >
          <div className={cx('thumbnail')}>
            {thumbnailList &&
              thumbnailList.map((image, idx) => (
                <Image
                  key={idx}
                  src={image}
                  alt="timeline thumbanil"
                  className={cx('thumbnail-image')}
                  width={100}
                  height={80}
                />
              ))}
            {/* <canvas ref={frameRef} /> */}
          </div>
        </CropSlider>
      </div>
    </Fragment>
  );
};
