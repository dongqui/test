import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ThinTexture } from '@babylonjs/core/Materials/Textures/thinTexture';
import { Timeline } from '@babylonjs/controls';
import * as globalUIActions from 'actions/Common/globalUI';
import { WARNING_02 } from 'constants/Text';
import Box, { BoxProps } from 'components/Layout/Box';
import { useWindowSize } from 'hooks/common';
import RenderingPanel from './RenderingPanel';
import MiddleBar from './MiddleBar';
import TimelinePanel from './TimelinePanel';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { Typography } from 'components/Typography';
import { Dropdown } from 'components/Dropdown';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
}

const VideoMode = ({ browserType }: Props) => {
  const dispatch = useDispatch();
  const [windowWidth, windowHeight] = useWindowSize();
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceListLoaded, setVideoDeviceListLoaded] = useState(false);
  // permission이 없을 때에 handle 할 수 있게 만든 변수
  const [cameraPermission, setCameraPermission] = useState<boolean | undefined>(undefined);
  const [currentVideoDevice, setCurrentVideoDevice] = useState<MediaDeviceInfo | null>(null);
  const [currentVideoStream, setCurrentVideoStream] = useState<MediaStream | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentVideoURL, setVideoURL] = useState<string>();
  const [standbyCounter, setStandbyCounter] = useState(5);
  const countTimer = useRef<NodeJS.Timeout | null>(null);

  const boxProps = useMemo(
    () => ({
      US: {
        height: windowHeight - 180 - 38,
      } as BoxProps,
      LS: {
        height: 180,
      } as BoxProps,
      UP: {
        height: 36,
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
  const RECORD_STANDBY = RECORD_AVAILABLE && standbyCounter === 5 && countTimer.current === null;
  const RECORD_COUNTDOWN = RECORD_AVAILABLE && standbyCounter !== -1 && countTimer.current !== null;
  const ON_RECORDING = standbyCounter === -1 && countTimer.current === null;

  const headerInspector = async (file: File) => {
    const load = async () => {
      return new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onloadend = async (e: ProgressEvent<FileReader>) => {
          let extension = '';

          if (e.target && e.target.readyState === FileReader.DONE) {
            const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 16);

            let header = '';
            for (let i = 0; i < arr.length; i++) {
              header += arr[i].toString(16);
            }

            // mov - 66 74 79 70 71 74 20 20
            const regexMov = [
              new RegExp(/^((([0-9a-fA-F]{1,2})\s?){4})(6674797071742020)((([0-9a-fA-F]{1,2})\s?){2})/gi),
              new RegExp(/^((([0-9a-fA-F]{1,2})\s?){4})(7466707974712020)((([0-9a-fA-F]{1,2})\s?){2})/gi),
            ];

            // mp4 - 66 74 79 70
            // 뒤집힌 경우 예시 - 0000 2000 7466 7079 7369 6d6f 0000 0002
            const regexMp4 = [
              new RegExp(/^((([0-9a-fA-F]{1,2})\s?){4})(66747970)((([0-9a-fA-F]{1,2})\s?){8})/gi),
              new RegExp(/^((([0-9a-fA-F]{1,2})\s?){4})(74667079)((([0-9a-fA-F]{1,2})\s?){8})/gi),
            ];

            // webm - 1a 45 df a3
            const regexWebm = [new RegExp(/^((1a45dfa3))((([0-9a-fA-F]{1,2})\s?){12})/gi), new RegExp(/^((451aa3df))((([0-9a-fA-F]{1,2})\s?){12})/gi)];

            if (regexMov[0].test(header) || regexMov[1].test(header)) {
              extension = 'mov';
              resolve(extension);
              return;
            }

            if (regexMp4[0].test(header) || regexMp4[1].test(header)) {
              extension = 'mp4';
              resolve(extension);
              return;
            }

            if (regexWebm[0].test(header) || regexWebm[1].test(header)) {
              extension = 'webm';
              resolve(extension);
              return;
            }

            reject('Not supported extension');
          }
        };

        fileReader.readAsArrayBuffer(file);
      });
    };

    const extension = load()
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });

    return extension;
  };

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
    });
  }, []);

  const unmountCurrentStream = useCallback(() => {
    if (currentVideoStream) {
      const tracks = currentVideoStream.getTracks();
      tracks.forEach((track) => track.stop());
      setCurrentVideoStream(null);
      setCurrentVideoDevice(null);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [currentVideoStream]);

  function save(filename: string, data: Blob) {
    //@ts-ignore
    if (window.navigator.msSaveOrOpenBlob) {
      //@ts-ignore
      window.navigator.msSaveBlob(data, filename);
    } else {
      const elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(data);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  const startRecording = useCallback(() => {
    if (!cameraPermission) {
      console.log('no permission');
    }

    if (videoRecorder !== null) {
      videoRecorder.start();
    }
  }, [cameraPermission, videoRecorder]);

  const startCountdown = useCallback(() => {
    if (RECORD_STANDBY) {
      setStandbyCounter((prev) => --prev);
      countTimer.current = setInterval(() => setStandbyCounter((time) => --time), 1000);

      if (currentVideoStream !== null) {
        const recorder = new MediaRecorder(currentVideoStream, {
          mimeType: browserType === 'safari' ? 'video/mp4' : 'video/webm',
        });
        const data: Blob[] = [];

        recorder.ondataavailable = (e) => {
          data.push(e.data);
        };

        recorder.onstop = () => {
          const videoURL = URL.createObjectURL(new Blob(data, { type: browserType === 'safari' ? 'video/mp4' : 'video/webm' }));
          unmountCurrentStream();

          if (videoRef && videoRef.current) {
            setIsVideoLoaded(true);
            setVideoURL(videoURL);

            videoRef.current.src = videoURL;
          }

          // TODO: remove this (testing feature)
          // save(`test${Date.now()}.${browserType === 'safari' ? 'mp4' : 'webm'}`, new Blob(data, { type: browserType === 'safari' ? 'video/mp4' : 'video/webm' }));
        };

        setVideoRecorder(recorder);
      }
    }
  }, [RECORD_STANDBY, browserType, currentVideoStream, unmountCurrentStream]);

  const stopRecording = useCallback(() => {
    if (videoRecorder && videoRecorder.state === 'recording') {
      videoRecorder.stop();
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
    if (!ON_RECORDING && !RECORD_COUNTDOWN) {
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
  }, [videoDeviceListLoaded, videoDeviceList, currentVideoDevice, unmountCurrentStream, currentVideoURL, ON_RECORDING, RECORD_STANDBY, RECORD_COUNTDOWN]);

  useEffect(() => {
    if (currentVideoDevice !== null) {
      deviceInitialize(currentVideoDevice.deviceId);
    }
  }, [currentVideoDevice, deviceInitialize]);

  const handleDrop = async (files: File[]) => {
    unmountCurrentStream();
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

    const acceptableFormats = ['mp4', 'mov', 'webm'];

    const extension = await headerInspector(file)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });

    const isAcceptableVideo = acceptableFormats.includes(extension);

    if (!isAcceptableVideo) {
      dispatch(
        globalUIActions.openModal('_AlertModal', {
          message: 'There are <b>no supported</b> files. Only mp4, mov, webm formats are supported.',
          title: 'Import failed',
        }),
      );
      return;
    }

    if (videoRef && videoRef.current) {
      const videoURL = URL.createObjectURL(files[0]);

      setIsVideoLoaded(true);
      setVideoURL(videoURL);

      videoRef.current.src = videoURL;
    }
  };

  const [duration, setDuration] = useState(0);

  const [timeline, setTimeline] = useState<Timeline>();
  const timelineRef = document.getElementById('timelineCanvas') as HTMLCanvasElement;

  const handleLoadMetadata = useCallback(() => {
    if (videoRef && videoRef.current && videoRef.current.src) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;

      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setIsVideoLoaded(true);

      if (currentVideoURL) {
        setTimeline(
          new Timeline(timelineRef, {
            totalDuration: duration + 20,
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
              hiddenVideo.autoplay = navigator.userAgent.indexOf('Edge') > 0 ? false : true;
              hiddenVideo.src = currentVideoURL;

              hiddenVideo.onloadeddata = () => {
                if (time === 0) {
                  done(hiddenVideo);
                } else {
                  hiddenVideo.onseeked = () => {
                    done(hiddenVideo);
                  };
                  hiddenVideo.currentTime = time;
                }
              };

              hiddenVideo.load();
            },
          }),
        );
      }
    }
  }, [currentVideoURL, duration, timelineRef]);

  useEffect(() => {
    if (timeline) {
      timeline.runRenderLoop(() => {
        if (videoRef.current && !videoRef.current.paused) {
          timeline.setCurrentTime(videoRef.current.currentTime);
        }
      });
    }
  }, [timeline]);

  const [videoStatus, setVideoStatus] = useState<'stop' | 'play' | 'pause'>('stop');

  const handleChangeVideoStatus = useCallback((status: 'stop' | 'play' | 'pause') => {
    setVideoStatus(status);
  }, []);

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

  return (
    <div className={cx('wrapper')}>
      <Box id="UP" {...boxProps.UP}>
        UP
      </Box>
      <Box id="US" className={cx('upper-section')} {...boxProps.US}>
        <Box id="LP" className={cx('library-panel')} {...boxProps.LP}>
          LP
        </Box>
        <Box id="RP" className={cx('rendering-panel')} {...boxProps.RP}>
          <RenderingPanel
            standByCount={RECORD_COUNTDOWN ? standbyCounter : undefined}
            isWithoutCamera={videoDeviceList.length === 0 && !isVideoLoaded}
            videoRef={videoRef}
            isVideoLoaded={isVideoLoaded}
            onLoadMetadata={handleLoadMetadata}
          />
        </Box>
        <Box id="CP" className={cx('control-panel')} {...boxProps.CP}>
          <div className={cx('wrapper')}>
            <div className={cx('section')}>
              <div className={cx('section-title')}>
                <Typography type="title">Video set</Typography>
              </div>
              <div className={cx('section-item')}>
                <Typography type="body">Camera</Typography>
                <Dropdown disabled={!cameraPermission} alignContext="right" className={cx('dropdown')} list={dropdownList} onSelect={selectHandler} />
              </div>
            </div>
          </div>
        </Box>
        {/*<ControlPanel/>*/}
      </Box>
      <Box id="LS" className={cx('lower-section')} {...boxProps.LS}>
        <Box id="MB" {...boxProps.MB}>
          <MiddleBar
            recordAvailable={RECORD_AVAILABLE && !RECORD_COUNTDOWN && !ON_RECORDING}
            videoRef={videoRef}
            videoStatus={videoStatus}
            onChange={handleChangeVideoStatus}
            onRecord={startCountdown}
            hasVideo={!!currentVideoURL}
            isRecording={ON_RECORDING}
            onRecordStop={stopRecording}
          />
        </Box>
        <Box id="TP" {...boxProps.TP}>
          <TimelinePanel duration={duration} isVideoLoaded={isVideoLoaded} videoStatus={videoStatus} onDrop={handleDrop} timeline={timeline} videoRef={videoRef} />
        </Box>
      </Box>
    </div>
  );
};

export default VideoMode;
