import { FocusEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RootState, useSelector } from 'reducers';
import { ThinTexture } from '@babylonjs/core/Materials/Textures/thinTexture';
import { Timeline } from '@babylonjs/controls';
import * as globalUIActions from 'actions/Common/globalUI';
import { useWindowSize } from 'hooks/common';
import Box, { BoxProps } from 'components/Layout/Box';
import { Typography } from 'components/Typography';
import { Dropdown } from 'components/Dropdown';
import { changeMode } from 'actions/modeSelection';
import { GhostButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { WARNING_02 } from 'constants/Text';
import RenderingPanel from './RenderingPanel';
import MiddleBar from './MiddleBar';
import TimelinePanel from './TimelinePanel';
import ControlPanel from './ControlPanel';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
  sceneId: string;
  token: string;
}

const VideoMode = ({ browserType, sceneId, token }: Props) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.modeSelection);

  const [windowWidth, windowHeight] = useWindowSize();
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceListLoaded, setVideoDeviceListLoaded] = useState(false);
  // permission이 없을 때에 handle 할 수 있게 만든 변수
  const [cameraPermission, setCameraPermission] = useState<boolean | undefined>(undefined);
  const [currentVideoDevice, setCurrentVideoDevice] = useState<MediaDeviceInfo | null>(null);
  const [currentVideoStream, setCurrentVideoStream] = useState<MediaStream | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentVideoURL, setVideoURL] = useState<string>('');
  const [isDeviceInitialized, setIsDeviceInitialized] = useState(false);
  const [standbyCounter, setStandbyCounter] = useState(5);
  const countTimer = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [timeline, setTimeline] = useState<Timeline>();
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<'stop' | 'play' | 'pause'>('stop');
  const [startValue, setStartValue] = useState(0);
  const [endValue, setEndValue] = useState(0);

  const timelineRef = document.getElementById('timelineCanvas') as HTMLCanvasElement;
  const dataRef = useRef<Blob[]>([]);
  const modals = useSelector((state) => state.globalUI.modals);

  const boxProps = useMemo(
    () => ({
      US: {
        height: windowHeight - 180 - 38,
      } as BoxProps,
      LS: {
        height: 180,
      } as BoxProps,
      LP: {
        width: 240,
        height: windowHeight - 180 - 38,
      } as BoxProps,
      RP: {
        height: windowHeight - 180 - 38,
      } as BoxProps,
      CP: {
        width: 250,
        height: windowHeight - 180 - 38,
      } as BoxProps,
      MB: {
        height: 32,
      } as BoxProps,
      TP: {
        height: 148,
      } as BoxProps,
    }),
    [windowHeight],
  );

  const PERMISSION_WAITING = !videoDeviceListLoaded && cameraPermission === undefined;
  const PERMISSION_DENIED = cameraPermission === false;
  const NO_DEVICE_FOUND = cameraPermission === true && videoDeviceListLoaded && videoDeviceList.length === 0;
  const VIDEO_STREAM_READY = !!currentVideoDevice && !!currentVideoStream;
  const RECORD_AVAILABLE = !(PERMISSION_WAITING || PERMISSION_DENIED || NO_DEVICE_FOUND) && VIDEO_STREAM_READY;
  const RECORD_STANDBY = RECORD_AVAILABLE && standbyCounter === 5;
  const RECORD_COUNTDOWN = RECORD_AVAILABLE && standbyCounter !== -1 && standbyCounter !== 5;
  const ON_RECORDING = standbyCounter === -1;
  const ON_VIDEO_MOUNTED = isVideoLoaded && currentVideoURL;

  const headerInspector = async (file: File) => {
    const load = async () => {
      return new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onloadend = async (e: ProgressEvent<FileReader>) => {
          const isDone = e.target?.readyState === FileReader.DONE;

          if (isDone) {
            const array = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 16);

            let fileHeader = '';
            for (let i = 0; i < array.length; i++) {
              fileHeader += array[i].toString(16);
            }

            const regexMov = [
              new RegExp(/^((([\da-fA-F]{1,2})\s?){4})(6674797071742020)((([\da-fA-F]{1,2})\s?){2})/gi),
              new RegExp(/^((([\da-fA-F]{1,2})\s?){4})(7466707974712020)((([\da-fA-F]{1,2})\s?){2})/gi),
            ];

            const regexMp4 = [
              new RegExp(/^((([\da-fA-F]{1,2})\s?){4})(66747970)((([\da-fA-F]{1,2})\s?){8})/gi),
              new RegExp(/^((([\da-fA-F]{1,2})\s?){4})(74667079)((([\da-fA-F]{1,2})\s?){8})/gi),
            ];

            const regexWebm = [new RegExp(/^(1a45dfa3)((([\da-fA-F]{1,2})\s?){12})/gi), new RegExp(/^(451aa3df)((([\da-fA-F]{1,2})\s?){12})/gi)];

            if (regexMov[0].test(fileHeader) || regexMov[1].test(fileHeader)) {
              resolve('mov');
            }

            if (regexMp4[0].test(fileHeader) || regexMp4[1].test(fileHeader)) {
              resolve('mp4');
            }

            if (regexWebm[0].test(fileHeader) || regexWebm[1].test(fileHeader)) {
              resolve('webm');
            }

            reject('Not supported extension');
          }
        };

        fileReader.readAsArrayBuffer(file);
      });
    };

    return load()
      .then((res) => {
        return res;
      })
      .catch((err) => {
        throw err;
      });
  };

  const unmountCurrentStream = useCallback(() => {
    if (currentVideoStream) {
      const tracks = currentVideoStream.getTracks();
      tracks.forEach((track) => track.stop());
      setCurrentVideoStream(null);
      setCurrentVideoDevice(null);
      setIsDeviceInitialized(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [currentVideoStream]);

  const handleDrop = async (files: File[]) => {
    if (files.length > 1) {
      dispatch(
        globalUIActions.openModal('AlertModal', {
          title: 'Warning',
          message: WARNING_02,
          confirmText: 'Close',
        }),
      );

      return;
    }

    const file = files[0];

    await headerInspector(file)
      .then(() => {
        if (videoRef.current) {
          const videoURL = URL.createObjectURL(files[0]);

          setIsVideoLoaded(true);
          setVideoURL(videoURL);
          unmountCurrentStream();

          videoRef.current.src = videoURL;
        }
      })
      .catch(() => {
        dispatch(
          globalUIActions.openModal('_AlertModal', {
            message: 'There are <b>no supported</b> files. Only mp4, mov, webm formats are supported.',
            title: 'Import failed',
          }),
        );
      });
  };

  const createThumbnails = useCallback(() => {
    let duration = 20;
    if (videoRef.current) {
      duration = videoRef.current.duration;
    }

    setTimeline(
      new Timeline(timelineRef, {
        totalDuration: 20,
        thumbnailWidth: 128,
        thumbnailHeight: 96,
        loadingTextureURI: '/images/Loading.png',
        getThumbnailCallback: (time: number, done: (input: ThinTexture | HTMLCanvasElement | HTMLVideoElement | string) => void) => {
          const hiddenVideo = document.createElement('video');
          document.body.append(hiddenVideo);

          hiddenVideo.setAttribute('playsinline', '');
          hiddenVideo.style.display = 'none';
          hiddenVideo.style.width = '1px';
          hiddenVideo.style.height = '1px';
          hiddenVideo.muted = true;
          hiddenVideo.loop = false;
          hiddenVideo.autoplay = navigator.userAgent.indexOf('Edge') <= 0;
          hiddenVideo.src = currentVideoURL;

          hiddenVideo.onloadeddata = () => {
            hiddenVideo.onseeked = () => {
              done(hiddenVideo);

              if (hiddenVideo.parentNode) {
                hiddenVideo.parentNode.removeChild(hiddenVideo);
              }
            };

            if (videoRef.current) {
              hiddenVideo.currentTime = (duration / 20) * time;
            } else {
              if (time === 0) {
                done(hiddenVideo);
              } else {
                hiddenVideo.currentTime = time;
              }
            }
          };

          setTimeout(() => hiddenVideo.load(), time * 10);
        },
      }),
    );
  }, [currentVideoURL, timelineRef]);

  const handleLoadMetadata = useCallback(() => {
    if (videoRef.current && videoRef.current.src && currentVideoURL && isVideoLoaded) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;

      if (videoRef.current.duration !== Infinity) {
        setDuration(videoRef.current.duration);
        setEndValue(videoRef.current.duration);

        createThumbnails();
      } else {
        videoRef.current.currentTime = Number.MAX_SAFE_INTEGER;
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            setDuration(videoRef.current.duration);
            setEndValue(videoRef.current.duration);

            createThumbnails();
          }
        }, 500);
      }
    }
  }, [createThumbnails, currentVideoURL, isVideoLoaded]);

  useEffect(() => {
    if (timeline) {
      timeline.runRenderLoop(() => {
        if (videoRef.current && !videoRef.current.paused) {
          timeline.setCurrentTime(videoRef.current.currentTime);
        }
      });
    }
  }, [timeline]);

  const handleChangeVideoStatus = useCallback((status: 'stop' | 'play' | 'pause') => {
    setVideoStatus(status);
  }, []);

  const requestCameraPermission = useCallback(async () => {
    return await navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        return true;
      })
      .catch(() => false);
  }, []);

  // return videoinput device list
  // return single device which has empty deviceId when requires permission
  const getVideoInputDeviceList: () => Promise<MediaDeviceInfo[]> = useCallback(async () => {
    return await navigator.mediaDevices
      .enumerateDevices()
      .then((totalDevice) => totalDevice.filter((device) => device.kind === 'videoinput'))
      .catch(() => []);
  }, []);

  const deviceInitialize = useCallback(async (deviceId: string) => {
    const constraints = {
      video: {
        width: { ideal: 3840 },
        height: { ideal: 2160 },
        aspectRatio: { ideal: 4 / 3 },
        frameRate: { ideal: 60 },
        deviceId: { exact: deviceId },
      },
      audio: false,
    };
    await navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCurrentVideoStream(stream);
      setIsDeviceInitialized(true);
    });
  }, []);

  const startRecording = useCallback(() => {
    if (videoRecorder !== null) {
      videoRecorder.start();
    }
  }, [videoRecorder]);

  const startCountdown = useCallback(() => {
    if (PERMISSION_WAITING) {
      dispatch(
        globalUIActions.openModal('_AlertModal', {
          message: 'You need access to the camera to take video. Please allow camera access in the top left modal.',
          title: 'Camera is blocked',
        }),
      );
      return;
    }

    if (PERMISSION_DENIED) {
      dispatch(
        globalUIActions.openModal('_AlertModal', {
          message: 'You need access to the camera to take video. Unblock the camera with the camera block icon on the right side of the address bar.',
          title: 'Camera is blocked',
        }),
      );
      return;
    }

    if (NO_DEVICE_FOUND) {
      dispatch(
        globalUIActions.openModal('_AlertModal', {
          message: 'You need connect to the camera to take video. Check the camera connection.',
          title: 'Camera not connected',
        }),
      );
      return;
    }

    if (RECORD_STANDBY) {
      setStandbyCounter((prev) => --prev);
      countTimer.current = setInterval(() => setStandbyCounter((time) => --time), 1000);

      if (currentVideoStream !== null) {
        const recorder = new MediaRecorder(currentVideoStream, {
          mimeType: browserType === 'safari' ? 'video/mp4' : 'video/webm',
        });

        recorder.ondataavailable = (e) => {
          if (dataRef.current) dataRef.current.push(e.data);
        };

        recorder.onstop = () => {
          if (dataRef.current) {
            const videoURL = URL.createObjectURL(new Blob(dataRef.current, { type: browserType === 'safari' ? 'video/mp4' : 'video/webm' }));
            dataRef.current = [];
            unmountCurrentStream();

            if (videoRef && videoRef.current) {
              setVideoURL(videoURL);
              setIsVideoLoaded(true);
              videoRef.current.src = videoURL;
            }
          }
        };

        setVideoRecorder(recorder);
      }
    }
  }, [PERMISSION_WAITING, PERMISSION_DENIED, NO_DEVICE_FOUND, RECORD_STANDBY, dispatch, currentVideoStream, browserType, unmountCurrentStream]);

  const cancelCountdown = useCallback(() => {
    setVideoRecorder(null);
    setStandbyCounter(5);
    if (countTimer.current) {
      clearInterval(countTimer.current);
      countTimer.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (videoRecorder && videoRecorder.state === 'recording') {
      videoRecorder.stop();
      setVideoRecorder(null);
    }
  }, [videoRecorder]);

  const changeVideoDevice = useCallback(
    (device: MediaDeviceInfo) => {
      // when change camera
      if (device !== currentVideoDevice) {
        unmountCurrentStream();
        setCurrentVideoDevice(device);
      }
    },
    [currentVideoDevice, unmountCurrentStream],
  );

  const unmountVideo = useCallback(() => {
    if (currentVideoURL && videoRef.current) {
      const tempCurrentVideoURL = currentVideoURL;
      setVideoURL('');
      setDuration(0);
      videoRef.current.src = '';
      URL.revokeObjectURL(tempCurrentVideoURL);
    }
  }, [currentVideoURL, videoRef]);

  const switchStandbyMode = useCallback(() => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete previous video taken?',
        message: 'Your video will be deleted to take a new video.',
        confirmText: 'Delete',
        confirmButtonColor: 'negative',
        onConfirm: () => {
          setStartValue(0);
          setEndValue(0);
          unmountVideo();
          setStandbyCounter(5);
          setIsVideoLoaded(false);
          setVideoStatus('stop');
        },
      }),
    );
  }, [dispatch, unmountVideo]);

  useEffect(() => {
    if (standbyCounter === 0 && countTimer.current) {
      clearInterval(countTimer.current);
      countTimer.current = null;
      setStandbyCounter(-1);
      startRecording();
    }
  }, [standbyCounter, startRecording]);

  useEffect(() => {
    function handleDeviceChange() {
      getVideoInputDeviceList().then((devices) => {
        setVideoDeviceList(devices);
      });
    }

    async function initialVideoDevice() {
      let devices = await getVideoInputDeviceList();

      // cannot find any deviceId but found videoinput group id
      if (devices.length === 1 && !devices[0].deviceId) {
        const permissionGranted = await requestCameraPermission();
        setCameraPermission(permissionGranted);

        if (!permissionGranted) {
          return;
        }

        // after permission granted, get device list again
        devices = await getVideoInputDeviceList();
      } else {
        setCameraPermission(true);
      }

      setVideoDeviceList(devices);
      setVideoDeviceListLoaded(true);

      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

      return handleDeviceChange;
    }

    initialVideoDevice();

    return () => navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
  }, [getVideoInputDeviceList, requestCameraPermission]);

  useEffect(() => {
    if (!ON_RECORDING && !RECORD_COUNTDOWN && !currentVideoURL && !isVideoLoaded) {
      if (videoDeviceListLoaded && videoDeviceList.length > 0) {
        if (!currentVideoDevice) {
          setCurrentVideoDevice(videoDeviceList[0]);
        } else if (videoDeviceList.findIndex((v) => v.deviceId === currentVideoDevice?.deviceId) === -1) {
          unmountCurrentStream();
          setCurrentVideoDevice(videoDeviceList[0]);
        }
      } else if (videoDeviceListLoaded && videoDeviceList.length === 0) {
        unmountCurrentStream();
      }
    }
  }, [videoDeviceListLoaded, videoDeviceList, currentVideoDevice, unmountCurrentStream, currentVideoURL, ON_RECORDING, RECORD_STANDBY, RECORD_COUNTDOWN, isVideoLoaded]);

  useEffect(() => {
    if (currentVideoDevice !== null && !isDeviceInitialized) {
      deviceInitialize(currentVideoDevice.deviceId);
    }
  }, [currentVideoDevice, deviceInitialize, isDeviceInitialized, isVideoLoaded, unmountCurrentStream]);

  const dropdownList = useMemo(() => {
    return videoDeviceList.map((device) => ({
      key: device.deviceId,
      value: device.label,
      isSelected: currentVideoDevice?.deviceId === device.deviceId,
    }));
  }, [currentVideoDevice, videoDeviceList]);

  const selectHandler = useCallback(
    (key: string) => {
      const selected = videoDeviceList.findIndex((device) => device.deviceId === key);
      if (selected !== -1) {
        changeVideoDevice(videoDeviceList[selected]);
      }
    },
    [changeVideoDevice, videoDeviceList],
  );

  useEffect(() => {
    if (mode === 'unmountVideoMode') {
      if (currentVideoURL) {
        dispatch(
          globalUIActions.openModal('ConfirmModal', {
            title: 'Delete previous video taken?',
            message: 'Your video will be deleted to take a new video.',
            confirmText: 'Delete',
            confirmButtonColor: 'negative',
            onConfirm: () => {
              unmountVideo();
              unmountCurrentStream();
              dispatch(changeMode({ mode: 'animationMode' }));
            },
            onCancel: () => {
              dispatch(changeMode({ mode: 'videoMode' }));
            },
          }),
        );
      } else {
        unmountVideo();
        unmountCurrentStream();
        dispatch(changeMode({ mode: 'animationMode' }));
      }
    }
  }, [currentVideoURL, dispatch, mode, unmountCurrentStream, unmountVideo]);

  const handleChangeStartValue = useCallback((value: number) => {
    setStartValue(value);
  }, []);

  const handleChangeEndValue = useCallback((value: number) => {
    setEndValue(value);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (ON_VIDEO_MOUNTED && e.key === ' ') {
        if (videoStatus === 'stop' || videoStatus === 'pause') {
          handleChangeVideoStatus('play');
          videoRef.current?.play();
        } else {
          handleChangeVideoStatus('pause');
          videoRef.current?.pause();
        }
      }
    },
    [ON_VIDEO_MOUNTED, handleChangeVideoStatus, videoStatus],
  );

  useEffect(() => {
    if (modals.length === 0) {
      window.addEventListener('keypress', handleKeyDown);

      return () => window.removeEventListener('keypress', handleKeyDown);
    }
  }, [handleKeyDown, modals]);

  const blurFocused = (e: FocusEvent<HTMLButtonElement>) => e.target.blur();

  return (
    <div className={cx('wrapper')}>
      <Box id="US" className={cx('upper-section')} {...boxProps.US}>
        <Box id="LP" className={cx('library-panel')} {...boxProps.LP}>
          <div className={cx('lp-button-wrapper')}>
            {ON_VIDEO_MOUNTED && (
              <GhostButton onFocus={blurFocused} onClick={switchStandbyMode} className={cx('lp-button')}>
                <div className={cx('lp-button-inner')}>
                  <IconWrapper icon={SvgPath.ChevronLeft} className={cx('button-icon')} />
                  <Typography type="title">back to standby</Typography>
                </div>
              </GhostButton>
            )}
          </div>
        </Box>
        <Box id="RP" className={cx('rendering-panel')} {...boxProps.RP}>
          <RenderingPanel
            cancelCountdown={cancelCountdown}
            standByCount={RECORD_COUNTDOWN ? standbyCounter : undefined}
            isWithoutCamera={videoDeviceList.length === 0 && !isVideoLoaded}
            videoRef={videoRef}
            isVideoLoaded={isVideoLoaded}
            onLoadMetadata={handleLoadMetadata}
          />
        </Box>
        <Box id="CP" className={cx('control-panel')} {...boxProps.CP}>
          {!ON_VIDEO_MOUNTED ? (
            <div className={cx('wrapper')}>
              <div className={cx('section')}>
                <div className={cx('section-title')}>
                  <Typography type="title">Video set</Typography>
                </div>
                <div className={cx('section-item')}>
                  <Typography type="body">Camera</Typography>
                  <Dropdown
                    disabled={!cameraPermission || RECORD_COUNTDOWN || ON_RECORDING}
                    alignContext="right"
                    className={cx('dropdown')}
                    list={dropdownList}
                    onSelect={selectHandler}
                  />
                </div>
              </div>
            </div>
          ) : (
            <ControlPanel
              startValue={startValue}
              endValue={endValue}
              duration={duration}
              videoRef={videoRef}
              onUnmount={unmountVideo}
              sceneId={sceneId}
              token={token}
              browserType={browserType}
            />
          )}
        </Box>
      </Box>
      <Box id="LS" className={cx('lower-section')} {...boxProps.LS}>
        <Box id="MB" {...boxProps.MB}>
          <MiddleBar
            switchStandbyMode={switchStandbyMode}
            videoRef={videoRef}
            videoStatus={videoStatus}
            isVideoLoaded={isVideoLoaded}
            onChange={handleChangeVideoStatus}
            onRecord={startCountdown}
            isCountdown={RECORD_COUNTDOWN}
            isRecording={ON_RECORDING}
            onRecordStop={stopRecording}
            startValue={startValue}
          />
        </Box>
        <Box id="TP" {...boxProps.TP}>
          <TimelinePanel
            dropzoneDisabled={RECORD_COUNTDOWN || ON_RECORDING}
            duration={duration}
            isVideoLoaded={isVideoLoaded}
            videoStatus={videoStatus}
            onDrop={handleDrop}
            timeline={timeline}
            videoRef={videoRef}
            startValue={startValue}
            endValue={endValue}
            onChangeStart={handleChangeStartValue}
            onChangeEnd={handleChangeEndValue}
          />
        </Box>
      </Box>
    </div>
  );
};

export default VideoMode;
