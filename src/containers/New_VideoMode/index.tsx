import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box, { BoxProps } from 'components/Layout/Box';
import { BaseDropzone } from 'components/Input/Dropzone';
import { FilledButton, OutlineButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useWindowSize } from 'hooks/common';
import ControlPanel from './ControlPanel';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { Typography } from 'components/Typography';
import { Dropdown } from 'components/Dropdown';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
}

const VideoMode = ({ browserType }: Props) => {
  const [windowWidth, windowHeight] = useWindowSize();
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceListLoaded, setVideoDeviceListLoaded] = useState(false);
  // permission이 없을 때에 handle 할 수 있게 만든 변수
  const [cameraPermission, setCameraPermission] = useState<boolean | undefined>(undefined);
  const [currentVideoDevice, setCurrentVideoDevice] = useState<MediaDeviceInfo | null>(null);
  const [currentVideoStream, setCurrentVideoStream] = useState<MediaStream | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const boxProps = useMemo(
    () => ({
      US: {
        height: windowHeight - 180 - 36,
      } as BoxProps,
      LS: {
        height: 180,
      } as BoxProps,
      UP: {
        height: 36,
      } as BoxProps,
      LP: {
        width: 240,
      } as BoxProps,
      RP: {
        height: windowHeight - 180 - 36,
      } as BoxProps,
      CP: {
        width: 250,
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
        if (videoRef.current) {
          videoRef.current.src = videoURL;
        }

        // testing feature
        save(`test${Date.now()}.${browserType === 'safari' ? 'mp4' : 'webm'}`, new Blob(data, { type: browserType === 'safari' ? 'video/mp4' : 'video/webm' }));
      };

      recorder.start(currentVideoStream.getTracks()[0].getSettings()?.frameRate ?? 1000);

      setVideoRecorder(recorder);
    }
  }, [browserType, currentVideoStream, unmountCurrentStream]);

  const stopRecording = useCallback(() => {
    if (videoRecorder && videoRecorder.onstop && videoRecorder.state === 'recording') {
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
    async function initialVideoDevice() {
      let devices = await getVideoInputDeviceList();

      // cannot find any deviceId but found videoinput group id
      if (devices.length === 1 && !devices[0].deviceId) {
        const permissionGranted = await requestCameraPermission();
        setCameraPermission(permissionGranted);

        if (!permissionGranted) {
          console.log('camera permission request denied');
          return;
        }

        // after permission granted, get device list again
        devices = await getVideoInputDeviceList();
      }

      setVideoDeviceList(devices);
      setVideoDeviceListLoaded(true);
    }

    initialVideoDevice();
  }, [getVideoInputDeviceList, requestCameraPermission]);

  useEffect(() => {
    if (videoDeviceListLoaded && videoDeviceList.length > 0) {
      setCurrentVideoDevice(videoDeviceList[0]);
    }
  }, [videoDeviceListLoaded, videoDeviceList]);

  useEffect(() => {
    if (currentVideoDevice !== null) {
      deviceInitialize(currentVideoDevice.deviceId);
    }
  }, [currentVideoDevice, deviceInitialize]);

  const handleDrop = (files: File[]) => {
    unmountCurrentStream();
    console.log(files);
  };

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
          <video
            ref={videoRef}
            className={cx('video')}
            {...{
              autoPlay: true,
              playsInline: true,
              muted: true,
              loop: true,
            }}
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
                <Dropdown alignContext="right" className={cx('dropdown')} list={dropdownList} onSelect={selectHandler} />
              </div>
            </div>
          </div>
        </Box>
      </Box>
      <Box id="LS" className={cx('lower-section')} {...boxProps.LS}>
        <Box id="MB" {...boxProps.MB}>
          MB
        </Box>
        <Box id="TP" {...boxProps.TP}>
          <div className={cx('dropzone')}>
            <BaseDropzone onDrop={handleDrop} className={cx('dropzone-outer')} active={cx('dropzone-active')}>
              {({ open }) => (
                <div className={cx('dropzone-guide')}>
                  <IconWrapper className={cx('icon-plus')} icon={SvgPath.Plus} />
                  <div className={cx('dropzone-guide-text')}>
                    Drag and drop <br />
                    or
                  </div>
                  <OutlineButton onClick={open}>Browse File</OutlineButton>
                </div>
              )}
            </BaseDropzone>
          </div>
        </Box>
      </Box>
    </div>
  );
};

export default VideoMode;
