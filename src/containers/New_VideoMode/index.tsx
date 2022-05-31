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
        }; // onloadend

        fileReader.readAsArrayBuffer(file);
      });
    };

    const extension = load()
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log(err);
        return err;
      });

    return extension;
  };

  const handleDrop = async (files: File[]) => {
    if (files.length > 1) {
      return;
    }

    const file = files[0];
    console.log(file.type);

    // mp4, mov, webm
    const acceptableFormats = ['mp4', 'mov', 'webm'];

    const extension = await headerInspector(file)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log(err);
        return err;
      });

    const isAcceptableVideo = acceptableFormats.includes(extension);

    console.log('extension > ' + extension, isAcceptableVideo);

    if (!isAcceptableVideo) {
      return;
    }

    if (videoRef && videoRef.current) {
      const videoURL = URL.createObjectURL(files[0]);

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
