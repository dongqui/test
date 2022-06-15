import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box, { BoxProps } from 'components/Layout/Box';
import { BaseDropzone } from 'components/Input/Dropzone';
import { FilledButton, OutlineButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useWindowSize } from 'hooks/common';
import ControlPanel from './ControlPanel';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  browserType: string;
}

const VideoMode = ({ browserType }: Props) => {
  const [windowWidth, windowHeight] = useWindowSize();
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState<MediaDeviceInfo | null>(null);
  const [videoDeviceListLoaded, setVideoDeviceListLoaded] = useState(false);
  const [currentVideoStream, setCurrentVideoStream] = useState<MediaStream | null>(null);
  const [videoRecorder, setVideoRecorder] = useState<MediaRecorder>();
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
      .catch((e) => false);
  }, []);

  const getVideoDeviceList = useCallback(async () => {
    const devices = await navigator.mediaDevices
      .enumerateDevices()
      .then((totalDevice) => {
        return totalDevice.filter((device) => device.kind === 'videoinput');
      })
      .catch((error) => {
        return [];
      });

    // cannot find any deviceId but found videoinput group id
    if (devices.length === 1 && devices[0].deviceId === '') {
      if (!(await requestCameraPermission())) {
        console.log('request denied');
      } else {
        await getVideoDeviceList();
        return;
      }
    } else {
      setVideoDeviceList(devices);
    }

    setVideoDeviceListLoaded(true);
  }, [requestCameraPermission]);

  const videoDeviceInitialize = useCallback(async (deviceId: string) => {
    const constraint = {
      video: {
        width: { ideal: 3840 },
        height: { ideal: 2160 },
        aspectRatio: { ideal: 4 / 3 },
        frameRate: { ideal: 60 },
        deviceId: { exact: deviceId },
      },
      audio: false,
    };
    await navigator.mediaDevices.getUserMedia(constraint).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCurrentVideoStream(stream);
    });
  }, []);

  const unmountStream = useCallback(() => {
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
        unmountStream();
        if (videoRef.current) {
          videoRef.current.src = videoURL;
        }

        save(`test.${browserType === 'safari' ? 'mp4' : 'webm'}`, new Blob(data, { type: browserType === 'safari' ? 'video/mp4' : 'video/webm' }));
      };

      recorder.start();

      setVideoRecorder(recorder);
    }
  }, [browserType, currentVideoStream, unmountStream]);

  const stopRecording = useCallback(() => {
    if (videoRecorder && videoRecorder.onstop && videoRecorder.state === 'recording') {
      videoRecorder.stop();
    }
  }, [videoRecorder]);

  const changeVideoDevice = useCallback(
    (device: MediaDeviceInfo) => {
      // when change camera
      if (device !== currentVideoDevice) {
        unmountStream();
        setCurrentVideoDevice(device);
      }
    },
    [currentVideoDevice, unmountStream],
  );

  useEffect(() => {
    getVideoDeviceList();
  }, [getVideoDeviceList]);

  useEffect(() => {
    if (videoDeviceList.length > 0 && videoDeviceListLoaded) {
      setCurrentVideoDevice(videoDeviceList[0]);
    }
  }, [videoDeviceListLoaded, videoDeviceList]);

  useEffect(() => {
    if (currentVideoDevice !== null) {
      videoDeviceInitialize(currentVideoDevice.deviceId);
    }
  }, [currentVideoDevice, videoDeviceInitialize]);

  const handleDrop = (files: File[]) => {
    unmountStream();
    console.log(files);
  };

  return (
    <div className={cx('wrapper')}>
      <Box id="UP" {...boxProps.UP}>
        UP
      </Box>
      <Box id="US" className={cx('upper-section')} {...boxProps.US}>
        <Box id="LP" className={cx('library-panel')} {...boxProps.LP}>
          {videoDeviceListLoaded &&
            videoDeviceList.map((device) => (
              <FilledButton style={{ marginBottom: '10px' }} key={device.deviceId} onClick={() => changeVideoDevice(device)}>
                {device.label}
              </FilledButton>
            ))}
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
          <ControlPanel />
        </Box>
      </Box>
      <Box id="LS" className={cx('lower-section')} {...boxProps.LS}>
        <Box id="MB" {...boxProps.MB}>
          <FilledButton onClick={startRecording}>start</FilledButton>
          <FilledButton onClick={stopRecording}>end</FilledButton>
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
