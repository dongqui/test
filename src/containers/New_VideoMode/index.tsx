import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import Box, { BoxProps } from 'components/Layout/Box';
import { BaseDropzone } from 'components/Input/Dropzone';
import { OutlineButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
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

  const headerInspector = (file: File) => {
    const blob = file;
    const fileReader = new FileReader();
    fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
      if (e.target && e.target.readyState === FileReader.DONE) {
        const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 16);

        let header = '';
        const temp = [];
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
          temp.push(arr[i].toString(16));
        }

        // 52 49 46 46 ?? ?? ?? ?? 41 56 49 20 4c 49 53 54 - avi
        // 66 74 79 70 (69 73 6f 6d) // (4d 53 4e 56) - mp4
        // ?? ?? ?? ?? 66 74 79 70 71 74 20 20 - mov
        // 1a 45 df a3 - webm
      }
    };

    fileReader.readAsArrayBuffer(blob);
  };

  const handleDrop = (files: File[]) => {
    if (files.length > 1) {
      return;
    }

    const file = files[0];

    // avi, mp4, mov, webm
    const isAcceptableFormat = ['video/x-msvideo', 'video/mp4', 'video/quicktime', 'video/webm'];

    const videoURL = URL.createObjectURL(files[0]);

    if (videoRef && videoRef.current) {
      videoRef.current.src = videoURL;
    }
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
        setIsCameraLoaded({ loaded: false, error: true });
        return [];
      });

    setCameraDeviceList(devices);
  }, []);

  const mediaStreamInitialize = useCallback(async () => {
    const constraint = { video: true };
    // await navigator.mediaDevices.getUserMedia(constraint).then((stream) => {
    //   if (videoRef.current) {
    //     videoRef.current.srcObject = stream;
    //   }

    //   setCurrentStream(stream);
    // });

    await getCameraDeviceList();
  }, [getCameraDeviceList]);

  useEffect(() => {
    mediaStreamInitialize();
  }, [mediaStreamInitialize]);

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
