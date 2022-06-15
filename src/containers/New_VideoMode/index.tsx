import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box, { BoxProps } from 'components/Layout/Box';
import { BaseDropzone } from 'components/Input/Dropzone';
import { OutlineButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useWindowSize } from 'hooks/common';
import ControlPanel from './ControlPanel';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const VideoMode = () => {
  const [windowWidth, windowHeight] = useWindowSize();
  const [videoDeviceList, setVideoDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [currentVideoDevice, setCurrentVideoDevice] = useState<MediaDeviceInfo>();
  const [videoDeviceLoaded, setVideoDeviceLoaded] = useState(false);
  const [currentVideoStream, setCurrentVideoStream] = useState<MediaStream>();
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

  const getVideoDeviceList = useCallback(async () => {
    const devices = await navigator.mediaDevices
      .enumerateDevices()
      .then((totalDevice) => {
        return totalDevice.filter((device) => device.kind === 'videoinput');
      })
      .catch((error) => {
        return [];
      });

    setVideoDeviceLoaded(true);
    setVideoDeviceList(devices);
  }, []);

  const videoDeviceInitialize = useCallback(async (deviceId: string) => {
    const constraint = {
      video: {
        width: { ideal: 3840 },
        height: { ideal: 2160 },
        aspectRatio: { ideal: 4 / 3 },
        frameRate: { ideal: 30 },
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

  useEffect(() => {
    getVideoDeviceList();
  }, [getVideoDeviceList]);

  useEffect(() => {
    if (videoDeviceList.length > 0 && currentVideoDevice === undefined) {
      setCurrentVideoDevice(videoDeviceList[0]);
    }
  }, [currentVideoDevice, videoDeviceList]);

  useEffect(() => {
    if (currentVideoDevice !== undefined) {
      videoDeviceInitialize(currentVideoDevice.deviceId);
    }
  }, [currentVideoDevice, videoDeviceInitialize]);

  const unmountStream = useCallback(() => {
    if (currentVideoStream) {
      const tracks = currentVideoStream.getTracks();
      tracks.forEach((track) => track.stop());

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [currentVideoStream]);

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
            }}
          />
        </Box>
        <Box id="CP" className={cx('control-panel')} {...boxProps.CP}>
          <ControlPanel />
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
