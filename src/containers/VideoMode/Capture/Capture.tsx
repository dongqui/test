/* eslint-disable react-hooks/exhaustive-deps */
import { Fragment, useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'reducers';
import { UpperBar } from 'containers/UpperBar';
import { FilledButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { CropSlider } from '../CropSlider';
import { VMRuler } from '../VMRuler';
import Box, { BoxProps } from 'components/Layout/Box';
import { useMediaStream } from 'hooks/common';
import Image from 'next/image';
import { FunctionComponent } from 'hoist-non-react-statics/node_modules/@types/react';
import { is } from 'immer/dist/internal';
import axios, { Canceler } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames/bind';
import styles from './Capture.module.scss';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
}

export const VideoMode: FunctionComponent<Props> = ({ browserType }) => {
  const { videoURL } = useSelector((state) => state.modeSelection);
  const cameraListRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const testRef = useRef<HTMLDivElement>(null);
  let cancelTokenSource: Canceler;

  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [currentDevice, setCurrentDevice] = useState<string>('');
  const [currnetDeviceId, setCurrentDeviceId] = useState<string>('');
  const [thumbnailList, setThumbnailList] = useState([]);
  const [duration, setDuration] = useState<number>(0);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [indicatorPosition, setIndicatorPosition] = useState<number>(0);
  const [playState, setPlayState] = useState<boolean>(false);
  const [recordState, setRecordState] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [standbyState, setStandbyState] = useState<boolean>(false);
  const [cameraDropdownState, setCameraDropdownState] = useState<boolean>(false);
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [timer, setTimer] = useState<number>(5);

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
    stopStream,
  } = useMediaStream({
    ref: videoRef,
    canvasRef: canvasRef,
    recording: recording,
    currentDeviceId: currnetDeviceId,
    setThumbnailList: setThumbnailList,
    setDuration: setDuration,
    setPlayState: setPlayState,
    setRecordState: setRecordState,
    setRecording: setRecording,
    setStandbyState: setStandbyState,
    setTimer: setTimer,
    setDeviceList: setDeviceList,
    setCurrentDevice: setCurrentDevice,
    setCurrentDeviceId: setCurrentDeviceId,
    setCameraDropdownState: setCameraDropdownState,
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
    const cutStartTime = start ? ((Math.round(duration * 100) / 100) * start) / 100 : 0;
    const cutEndTime = ((Math.round(duration * 100) / 100) * end) / 100;
    setStart(cutStartTime);
    setEnd(cutEndTime);
  };

  const handleTimeline = useCallback((e) => {
    videoRef.current!.currentTime = e.target.value;
  }, []);

  const handleCurrentTime = useCallback(() => {
    setCurrentVideoTime(videoRef.current!.currentTime);
    setIndicatorPosition((videoRef.current!.currentTime / videoRef.current!.duration) * 100);
  }, []);

  const convertBlobToFile = useCallback(async ({ url, type, fileName }) => {
    const response = await fetch(url);
    const data = await response
      .blob()
      .then((response) => {
        const metaData = {
          type: type === 'webm' ? `video/webm` : type,
        };
        return new File([response], `${fileName}.${type}`, metaData);
      })
      .catch((err) => {
        throw err;
      });

    return data;
  }, []);

  const handleExtractMotion = useCallback(
    async ({ id, start, end, startTime, endTime, url, type, fileName, timeout }) => {
      const formData = new FormData();
      const file = await convertBlobToFile({ url, type, fileName }).then((response) => {
        formData.append('file', response);
        formData.append('type', type);
        formData.append('id', id);
        formData.append('start', start.toString());
        formData.append('end', end.toString());
        formData.append('startTime', startTime.toString());
        formData.append('endTime', endTime.toString());
      });

      const result = await axios({
        method: 'POST',
        url: 'https://shootapi.myplask.com:6500/mocap-upload-api',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        cancelToken: new axios.CancelToken((cancel) => {
          cancelTokenSource = cancel;
        }),
        timeout,
      })
        .then((response) => console.log(response))
        .catch((err) => console.log(err));
      // return {
      //   result,
      // };
    },
    [],
  );

  // 단축키 이벤트의 연속발생을 위한 keydown 이벤트(버튼을 누르고 있다면 연속으로 프레임이 넘어가야함)
  window.onkeydown = (e) => {
    if (!videoRef.current!.src) {
      return;
    }
    if (e.key === 'ArrowRight' || e.key === '.') {
      console.log('arrowright');
      videoRef.current!.currentTime += 0.01;
    } else if (e.key === 'ArrowLeft' || e.key === ',') {
      videoRef.current!.currentTime -= 0.01;
      console.log('arrowleft');
    } else if (e.key === ' ') {
      console.log('space');
      if (videoRef.current!.paused) {
        videoRef.current!.play();
      } else {
        videoRef.current!.pause();
      }
    }
  };

  useEffect(() => {
    console.log('videoURL: ', videoURL);
    if (!videoURL) {
      mediaStreamInitialize();
    }
  }, []);

  // 앱 실행시 최초의 실행중인 카메라의 기종을 감지하기 위함
  useEffect(() => {
    if (deviceList.length && !currentDevice) {
      setCurrentDevice(deviceList[0].label);
      setCurrentDeviceId(deviceList[0].deviceId);
    }
  }, [deviceList]);

  useEffect(() => {
    if (videoURL) {
      videoRef.current!.src = videoURL;
    }
  }, []);

  return (
    <Fragment>
      <Box id="UP" {...boxProps.up}>
        <UpperBar
          sceneName="Please enter a scene name"
          cameraListRef={cameraListRef}
          deviceList={deviceList}
          currentDevice={currentDevice}
          handleChangeCamera={handleChangeCamera}
          cameraDropdownState={cameraDropdownState}
          setCameraDropdownState={setCameraDropdownState}
          stopStream={stopStream}
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
          {/* <source id="mp4" src="http://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" /> */}
        </video>
        <div className={cx('countdown-overlay')}>
          {standbyState && <div className={cx('countdown')}>{timer}</div>}
        </div>
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
                  tabState={
                    (!recordState && item.id === 'playRecording') ||
                    item.id === 'pauseRecording' ||
                    item.id === 'stopRecording'
                  }
                  onClick={item.fn}
                />
              );
            })}
            {!recordState && <div className={cx('disable-control')}></div>}
          </div>
          {recordState && (
            <FilledButton
              className={cx('extract-button')}
              text="Extract Motion"
              onClick={() =>
                handleExtractMotion({
                  id: uuidv4(),
                  fileName: 'untitled',
                  type: browserType === 'safari' ? 'mp4' : 'webm',
                  start: 0,
                  end: end,
                  startTime: 0,
                  endTime: duration,
                  url: videoRef.current!.src,
                  timeout: 30 * 1000,
                })
              }
            />
          )}
          {!recordState && (
            <FilledButton className={cx('extract-button', 'disabled')} text="Extract Motion" />
          )}
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
