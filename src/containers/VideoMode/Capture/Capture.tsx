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
  const cameraListRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLCanvasElement>(null);

  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [currentDevice, setCurrentDevice] = useState<string>('');
  const [thumbnailList, setThumbnailList] = useState([]);
  const [duration, setDuration] = useState<number>(0);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [indicatorPosition, setIndicatorPosition] = useState<number>(0);
  const [playState, setPlayState] = useState<boolean>(false);
  const [recordState, setRecordState] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [standbyState, setStandbyState] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);

  const {
    mediaStreamInitialize,
    startRecording,
    stopRecording,
    playRecording,
    pauseRecording,
    backToStandby,
    stopVideo,
    startRecordingDelay,
    handleCameraList,
    handleChangeCamera,
  } = useMediaStream({
    ref: videoRef,
    canvasRef: canvasRef,
    recording: recording,
    setThumbnailList: setThumbnailList,
    setDuration: setDuration,
    setPlayState: setPlayState,
    setRecordState: setRecordState,
    setRecording: setRecording,
    setStandbyState: setStandbyState,
    setTimer: setTimer,
    setDeviceList: setDeviceList,
    setCurrentDevice: setCurrentDevice,
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
    { id: 'startRecording', icon: SvgPath.Record, fn: stopRecording },
    { id: 'standbyRecording', icon: SvgPath.Record, fn: backToStandby },
    { id: 'completeRecording', icon: SvgPath.Record, fn: startRecordingDelay },
    { id: 'playRecording', icon: SvgPath.PlayArrow, fn: playRecording },
    { id: 'pauseRecording', icon: SvgPath.PauseVideo, fn: pauseRecording },
    { id: 'stopRecording', icon: SvgPath.Stop, fn: stopVideo },
  ];

  // const handleChangeCamera = useCallback(() => {}, []);

  const handleVideoEnd = useCallback(() => {
    setPlayState(false);
  }, []);

  const handleSlider = (endpoint: { start: number; end: number }) => {
    const { start, end } = endpoint;
  };

  const handleTimeline = useCallback((e) => {
    videoRef.current!.currentTime = e.target.value;
  }, []);

  const handleCurrentTime = useCallback(() => {
    setCurrentVideoTime(videoRef.current!.currentTime);
    setIndicatorPosition((videoRef.current!.currentTime / videoRef.current!.duration) * 100);
  }, []);

  useEffect(() => {
    mediaStreamInitialize();
  }, []);

  return (
    <Fragment>
      <Box id="UP" {...boxProps.up}>
        <UpperBar
          sceneName="Please enter a scene name"
          cameraListRef={cameraListRef}
          deviceList={deviceList}
          handleChangeCamera={handleChangeCamera}
        />
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
              if ((!recording || standbyState) && item.id === 'startRecording') {
                return;
              }

              if (!standbyState && item.id === 'standbyRecording') {
                return;
              }

              if (recording && item.id === 'completeRecording') {
                return;
              }

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
            {!recordState && <div className={cx('disable-control')}></div>}
          </div>
          <FilledButton className={cx('extract-button')} text="Extract Motion" />
        </div>
      </Box>
      {recordState && (
        <Fragment>
          <VMRuler start={0} end={duration} />
          <div className={cx('thumbnail-wrap')}>
            <CropSlider
              start={0}
              end={100}
              duration={duration}
              currentVideoTime={currentVideoTime}
              handleTimeline={handleTimeline}
              indicatorPosition={indicatorPosition}
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
      )}
    </Fragment>
  );
};
