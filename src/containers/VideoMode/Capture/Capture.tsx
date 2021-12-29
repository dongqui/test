/* eslint-disable react-hooks/exhaustive-deps */
import { FunctionComponent, Fragment, useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import produce from 'immer';
import { UpperBar } from 'containers/UpperBar';
import { FilledButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { CropSlider } from '../CropSlider';
import { VMRuler } from '../VMRuler';
import Box, { BoxProps } from 'components/Layout/Box';
import { useMediaStream } from 'hooks/common';
import Image from 'next/image';
import axios, { Canceler } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as modeSelectActions from 'actions/modeSelection';
import { BaseModal } from 'new_components/Modal';
import classNames from 'classnames/bind';
import styles from './Capture.module.scss';

const cx = classNames.bind(styles);

interface Props {
  className?: string;
  browserType: string;
}

export const VideoMode: FunctionComponent<Props> = ({ className, browserType }) => {
  const dispatch = useDispatch();

  const lpNode = useSelector((state) => state.lpNode.node);
  const { mode, videoURL } = useSelector((state) => state.modeSelection);
  const cameraListRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const testRef = useRef<HTMLDivElement>(null);
  const thumbnailWrapRef = useRef<HTMLDivElement>(null);
  let cancelTokenSource = useRef<Canceler>();

  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [currentDevice, setCurrentDevice] = useState<string>('');
  const [currnetDeviceId, setCurrentDeviceId] = useState<string>('');
  const [srcAddress, setSrcAddress] = useState<string>('');
  const [thumbnailList, setThumbnailList] = useState([]);
  const [duration, setDuration] = useState<number>(0);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [indicatorPosition, setIndicatorPosition] = useState<number>(0);
  const [playState, setPlayState] = useState<boolean>(false);
  const [recordState, setRecordState] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [standbyState, setStandbyState] = useState<boolean>(false);
  const [recordOverTwice, setRecordOverTwice] = useState<boolean>(false);
  const [cameraDropdownState, setCameraDropdownState] = useState<boolean>(false);
  const [readyExtract, setReadyExtract] = useState<boolean>(false);
  const [basicExtractName, setBasicExtractName] = useState<string>('Exported motion');
  const [turnStandbyPhase, setTurnStandbyPhase] = useState<boolean>(false);
  const [onExtract, setOnExtract] = useState<boolean>(false);
  const [isExtractFailed, setIsExtractFailed] = useState<boolean>(false);
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [timer, setTimer] = useState<number>(5);
  const [isIndicatorClicked, setIsIndicatorClicked] = useState<boolean>(false);
  const [prevX, setPrevX] = useState<number>(0);

  const {
    mediaStreamInitialize,
    startRecording,
    stopRecording,
    playRecording,
    pauseRecording,
    handleMetaData,
    backToStandby,
    stopVideo,
    startRecordingDelay,
    handleCameraList,
    handleChangeCamera,
    stopStream,
  } = useMediaStream({
    ref: videoRef,
    start: start,
    end: end,
    canvasRef: canvasRef,
    recording: recording,
    currentDeviceId: currnetDeviceId,
    recordOverTwice: recordOverTwice,
    setThumbnailList: setThumbnailList,
    setDuration: setDuration,
    setPlayState: setPlayState,
    setRecordState: setRecordState,
    setRecording: setRecording,
    setRecordOverTwice: setRecordOverTwice,
    setStandbyState: setStandbyState,
    setSrcAddress: setSrcAddress,
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

  const handleTimeline = useCallback(
    (e) => {
      videoRef.current!.currentTime = e.target.value;
      if (e.target.value < start) {
        videoRef.current!.currentTime = start;
      } else if (e.target.value > end) {
        videoRef.current!.currentTime = end;
      }
    },
    [start, end],
  );

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

  /**
   * 모션을 추출하기 위한 함수
   * @param id - 비디오의 고유 번호 (uuid를 사용한 중복되지 않는 랜덤 ID)
   * @param start - 추출을 시작할 시작 시간
   * @param end - 추출을 시작한 후 끝낼 시간
   * @param startTime - 전체 영상의 시작 시간
   * @param endTime - 영상 전체의 종료 시간
   * @param duration - 영상의 길이 (metaData에서 자체적으로 frame 값을 추출 할 수 없을 경우 대비)
   */
  const handleExtractMotion = useCallback(async ({ id, start, end, startTime, endTime, url, type, fileName, timeout, duration }) => {
    setReadyExtract(false);
    setOnExtract(true);
    const formData = new FormData();
    const file = await convertBlobToFile({ url, type, fileName }).then((response) => {
      formData.append('file', response);
      formData.append('type', type);
      formData.append('id', id);
      formData.append('start', start.toString());
      formData.append('end', end.toString());
      formData.append('startTime', startTime.toString());
      formData.append('endTime', endTime.toString());
      formData.append('duration', duration);
    });

    const result = await axios({
      method: 'POST',
      url: 'https://shootapi.myplask.com:6500/mocap-upload-api-common',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      cancelToken: new axios.CancelToken((cancel) => {
        cancelTokenSource.current = cancel;
      }),
      timeout,
    })
      .then((response) => {
        const newMotionNode: LP.Node = {
          id: uuidv4(),
          parentId: '__root__',
          name: fileName,
          filePath: '\\root',
          childrens: [],
          extension: '',
          type: 'Motion',
          mocapData: response.data.result,
        };

        const nextNodes = produce(lpNode, (draft) => {
          draft.push(newMotionNode);
        });

        setReadyExtract(false);
        dispatch(lpNodeActions.changeNode({ nodes: nextNodes }));
        dispatch(modeSelectActions.changeMode({ mode: 'animationMode' }));
        dispatch(modeSelectActions.changeMode({ videoURL: '' }));
        setOnExtract(false);
        return response;
      })
      .catch((err) => {
        setReadyExtract(false);
        setIsExtractFailed(true);
        throw err;
      });
    // return {
    //   result,
    // };
  }, []);

  const handleDeleteRecord = useCallback(
    (e) => {
      if (videoRef.current!.src) {
        setTurnStandbyPhase(true);
      } else {
        startRecordingDelay();
      }
    },
    [startRecordingDelay, stopRecording],
  );

  // 단축키 이벤트의 연속발생을 위한 keydown 이벤트(버튼을 누르고 있다면 연속으로 프레임이 넘어가야함)
  const handleHotkeys = useCallback(
    (e: KeyboardEvent) => {
      const currentTime = videoRef.current!.currentTime;

      if (!videoRef.current!.src) {
        return;
      }
      if (!turnStandbyPhase && !readyExtract && !onExtract) {
        if (e.key === 's') {
          if (currentTime >= end) {
            return;
          } else if (currentTime <= end && currentTime > end - 0.1) {
            videoRef.current!.currentTime = end;
          } else if (currentTime < end) {
            videoRef.current!.currentTime += 0.1;
          }
        } else if (e.key === 'a') {
          if (currentTime <= start) {
            return;
          } else if (currentTime >= start && currentTime < start + 0.1) {
            videoRef.current!.currentTime = start;
          } else if (currentTime > start) {
            videoRef.current!.currentTime -= 0.1;
          }
        } else if (e.key === ' ') {
          if (videoRef.current!.paused) {
            playRecording();
          } else {
            pauseRecording();
          }
        }
      }
    },
    [start, end, videoRef.current?.currentTime],
  );

  const handleMouseMove = useCallback(
    (e, parentNodeWidth) => {
      // e.preventDefault();
      if (isIndicatorClicked) {
        setIndicatorPosition(indicatorPosition + ((e.clientX - prevX) / parentNodeWidth) * 100);
        if (((indicatorPosition + ((e.clientX - prevX) / parentNodeWidth) * 100) * videoRef.current!.duration) / 100 < start) {
          videoRef.current!.currentTime = start;
        } else if (((indicatorPosition + ((e.clientX - prevX) / parentNodeWidth) * 100) * videoRef.current!.duration) / 100 > end) {
          videoRef.current!.currentTime = end;
        } else {
          videoRef.current!.currentTime = ((indicatorPosition + ((e.clientX - prevX) / parentNodeWidth) * 100) * videoRef.current!.duration) / 100;
        }
      }
    },
    [prevX, isIndicatorClicked],
  );

  const handleMouseUp = useCallback((e) => {
    // e.preventDefault();
    setIsIndicatorClicked(false);
  }, []);

  const handleMouseDown = useCallback((e) => {
    // e.preventDefault();
    setIsIndicatorClicked(true);
    setPrevX(e.clientX);
  }, []);

  useEffect(() => {
    if (!turnStandbyPhase && !readyExtract && !onExtract) {
      window.addEventListener('keydown', handleHotkeys);
    }

    return () => {
      window.removeEventListener('keydown', handleHotkeys);
    };
  }, [start, end, turnStandbyPhase, readyExtract, onExtract]);

  // LP에서 비디오를 넘기지 않고 바로 VM으로 전환하는 경우
  useEffect(() => {
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

  // LP에서 비디오가 넘어올 경우를 위한 분기
  useEffect(() => {
    if (videoURL) {
      videoRef.current!.src = videoURL;
      handleMetaData();
      setRecordOverTwice(true);
    }
  }, []);

  useEffect(() => {
    if (currentVideoTime >= end - 0.25 && recordState && playState) {
      videoRef.current!.currentTime = start;
    }
  }, [currentVideoTime, end]);

  const playBox = [
    { id: 'startRecording', icon: SvgPath.VideoRecord, fn: stopRecording },
    { id: 'standbyRecording', icon: SvgPath.VideoRecord, fn: backToStandby },
    { id: 'completeRecording', icon: SvgPath.VideoRecord, fn: handleDeleteRecord },
    { id: 'playRecording', icon: SvgPath.PlayArrow, fn: playRecording },
    { id: 'pauseRecording', icon: SvgPath.PauseVideo, fn: pauseRecording },
    { id: 'stopRecording', icon: SvgPath.Stop, fn: stopVideo },
  ];

  return (
    <div className={className}>
      <Box id="UP" {...boxProps.up}>
        <UpperBar
          sceneName="Please enter a scene name"
          cameraListRef={cameraListRef}
          deviceList={deviceList}
          currentDevice={currentDevice}
          recordState={recordState}
          cameraDropdownState={cameraDropdownState}
          standbyState={standbyState}
          srcAddress={srcAddress}
          videoRef={videoRef}
          recording={recording}
          recordOverTwice={recordOverTwice}
          setSrcAddress={setSrcAddress}
          handleChangeCamera={handleChangeCamera}
          setCameraDropdownState={setCameraDropdownState}
          stopStream={stopStream}
        />
      </Box>
      <div className={cx('video-wrap')}>
        <canvas className={cx('thumbnail-canvas')} ref={canvasRef}></canvas>
        <video
          ref={videoRef}
          className={cx('video', { mirror: videoRef.current && !videoRef.current!.src })}
          {...videoOptions}
          onTimeUpdate={handleCurrentTime}
          onEnded={handleVideoEnd}
        >
          {/* <source id="mp4" src="http://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" /> */}
        </video>
        {standbyState && (
          <div className={cx('countdown-overlay')} onClick={backToStandby}>
            <div className={cx('countdown')}>{timer}</div>
          </div>
        )}
        {!currentDevice && !videoURL && (
          <div className={cx('countdown-overlay')}>
            <div className={cx('notification-wrapper')}>
              <IconWrapper className={cx('camera-icon')} icon={SvgPath.NoCamera}></IconWrapper>
              <p className={cx('no-camera-notification')}>There is No Connected Camera</p>
            </div>
          </div>
        )}
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
                  tabState={(!recordState && item.id === 'playRecording') || item.id === 'pauseRecording' || item.id === 'stopRecording'}
                  onClick={item.fn}
                />
              );
            })}
            {!recordState && <div className={cx('disable-control')}></div>}
          </div>
          {recordState && <FilledButton className={cx('extract-button')} text="Extract Motion" onClick={() => setReadyExtract(true)} />}
          {!recordState && <FilledButton className={cx('extract-button', 'disabled')} text="Extract Motion" />}
        </div>
      </Box>
      {recordState && (
        <Fragment>
          <VMRuler start={0} end={duration} />
          <div
            className={cx('thumbnail-wrap')}
            onMouseUp={handleMouseUp}
            onMouseMove={(e) => handleMouseMove(e, thumbnailWrapRef.current!.getBoundingClientRect().width - 32)}
            ref={thumbnailWrapRef}
          >
            <CropSlider
              start={0}
              end={100}
              duration={duration}
              currentVideoTime={currentVideoTime}
              handleTimeline={handleTimeline}
              videoRef={videoRef}
              thumbnailWrapRef={thumbnailWrapRef}
              indicatorPosition={indicatorPosition}
              isIndicatorClicked={isIndicatorClicked}
              handleMouseDown={handleMouseDown}
              handleMouseUp={handleMouseUp}
              handleMouseMove={handleMouseMove}
              onChange={handleSlider}
            >
              <div className={cx('thumbnail')}>
                {thumbnailList &&
                  thumbnailList.map((image, idx) => (
                    <Image key={idx} src={image} alt="timeline thumbanil" className={cx('thumbnail-image', 'no-select')} width={100} height={80} />
                  ))}
                {/* <canvas ref={frameRef} /> */}
              </div>
            </CropSlider>
          </div>
        </Fragment>
      )}
      {readyExtract && (
        <BaseModal isOpen={readyExtract}>
          <p className={cx('extract-name-paragraph')}>Enter the name of the motion to extract.</p>
          <input
            type="text"
            className={cx('extract-name-input')}
            placeholder="Exported motion"
            onChange={(e) => {
              setBasicExtractName(e.target.value);
            }}
          />
          <div className={cx('extract-name-wrapper')}>
            <FilledButton text="Cancel" className={cx('extract-button', 'cancel')} onClick={() => setReadyExtract(false)}></FilledButton>
            <FilledButton
              text="Ok"
              className={cx('extract-button')}
              onClick={() => {
                console.log(start);
                console.log(end);
                handleExtractMotion({
                  id: uuidv4(),
                  fileName: basicExtractName,
                  type: browserType === 'safari' ? 'mp4' : 'webm',
                  start: start,
                  end: end,
                  startTime: start,
                  endTime: end,
                  url: videoRef.current!.src,
                  timeout: videoRef.current!.duration * 30 * 1000,
                  duration: videoRef.current!.duration,
                });
              }}
            ></FilledButton>
          </div>
        </BaseModal>
      )}
      {turnStandbyPhase && (
        <BaseModal isOpen={turnStandbyPhase}>
          <h4 className={cx('modal-heading')}>Delete Previous Video Taken?</h4>
          <p className={cx('extract-name-paragraph')}>
            Your video will be <strong>deleted</strong> to take a new video.
          </p>
          <div className={cx('extract-name-wrapper')}>
            <FilledButton text="Cancel" className={cx('extract-button', 'cancel')} onClick={() => setTurnStandbyPhase(false)}></FilledButton>
            <FilledButton
              text="Delete"
              className={cx('extract-button')}
              onClick={() => {
                startRecordingDelay();
                setTurnStandbyPhase(false);
                URL.revokeObjectURL(videoRef.current!.src);
                videoRef.current!.removeAttribute('src');
              }}
            ></FilledButton>
          </div>
        </BaseModal>
      )}
      {onExtract && (
        <BaseModal isOpen={onExtract}>
          <div className={cx('loading-modal')}>
            <IconWrapper className={cx('loading-spinner')} icon={SvgPath.Spinner}></IconWrapper>
            <h4 className={cx('modal-heading', 'loading')}>Motions Extracting</h4>
            <p className={cx('extract-name-paragraph', 'loading')}>
              It can take up to {duration * 6 >= 60 ? Math.floor((duration * 6) / 60) + ' minutes' : Math.floor(duration * 6) + ' seconds'}
            </p>
            <FilledButton
              text="Cancel"
              className={cx('extract-button', 'cancel')}
              onClick={() => {
                setOnExtract(false);
                cancelTokenSource.current && cancelTokenSource.current();
              }}
            ></FilledButton>
          </div>
        </BaseModal>
      )}
      {isExtractFailed && (
        <BaseModal isOpen={isExtractFailed}>
          <div className={cx('failed-modal')}>
            <h4 className={cx('modal-heading')}>Extract Failed</h4>
            <p className={cx('extract-name-paragraph')}>
              Motion extraction <strong>failed</strong>. please try again.
            </p>
            <FilledButton text="Cancel" className={cx('extract-button', 'cancel')} onClick={() => setIsExtractFailed(false)}></FilledButton>
          </div>
        </BaseModal>
      )}
      {cameraDropdownState && <div className={cx('dropdown-overlay')} onClick={() => setCameraDropdownState(false)} />}
    </div>
  );
};
