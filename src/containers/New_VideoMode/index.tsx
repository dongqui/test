import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import Box, { BoxProps } from 'components/Layout/Box';
import { BaseDropzone } from 'components/Input/Dropzone';
import { OutlineButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { Video } from 'components/Video';
import { useWindowSize } from 'hooks/common';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const VideoMode = () => {
  const [windowWidth, windowHeight] = useWindowSize();

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
        width: 240,
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

  const handleDrop = (files: File[]) => {
    console.log(files);
  };

  const [isCameraLoaded, setIsCameraLoaded] = useState({ loaded: false, error: false });
  const [cameraDeviceList, setCameraDeviceList] = useState<MediaDeviceInfo[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream>();
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCameraDeviceList = useCallback(async () => {
    const devices = await navigator.mediaDevices
      .enumerateDevices()
      .then((totalDevice) => {
        setIsCameraLoaded({ loaded: true, error: false });
        return totalDevice.filter((device) => device.kind === 'videoinput');
      })
      .catch((error) => {
        console.warn(error);
        setIsCameraLoaded({ loaded: false, error: true });
        return [];
      });

    setCameraDeviceList(devices);
  }, []);

  const mediaStreamInitialize = useCallback(
    async (constraint = { video: true }) => {
      await navigator.mediaDevices.getUserMedia(constraint).then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCurrentStream(stream);
      });

      await getCameraDeviceList();
    },
    [getCameraDeviceList],
  );

  useEffect(() => {
    mediaStreamInitialize();
  }, [mediaStreamInitialize]);

  console.log('cameraDeviceList');
  console.log(cameraDeviceList, isCameraLoaded);

  const videoOptions = {
    autoPlay: true,
    playsInline: true,
    muted: true,
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
          {/* RP */}
          <video ref={videoRef} className={cx('video', { mirror: videoRef.current && !videoRef.current.src })} {...videoOptions} />
          {/* <Video /> */}
        </Box>
        <Box id="CP" className={cx('control-panel')} {...boxProps.CP}>
          CP
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
