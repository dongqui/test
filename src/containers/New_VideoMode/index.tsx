import { Fragment, useMemo, useEffect, useState, useCallback, useRef, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Timeline } from '@babylonjs/controls';
import Image from 'next/image';
import * as globalUIActions from 'actions/Common/globalUI';
import { IMPORT_ERROR_INVALID_FORMAT, WARNING_02 } from 'constants/Text';
import Box, { BoxProps } from 'components/Layout/Box';
import { BaseDropzone } from 'components/Input/Dropzone';
import { OutlineButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useWindowSize } from 'hooks/common';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const VideoMode = () => {
  const dispatch = useDispatch();
  const [windowWidth, windowHeight] = useWindowSize();

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
        width: 240,
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
        return err;
      });

    return extension;
  };

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentVideoURL, setVideoURL] = useState<string>();

  const handleDrop = async (files: File[]) => {
    if (files.length > 1) {
      // Upload one video file at a time.
      // Warning close
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

    // mp4, mov, webm
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

  const handleCaptureThumbnail = useCallback(() => {
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      const canvasContext = canvasRef.current.getContext('2d');

      if (canvasContext) {
        canvasContext.drawImage(videoRef.current as CanvasImageSource, 0, 0);
      }

      return canvasRef.current.toDataURL('image/webp');
    }
  }, []);

  const [thumbnailList, setThumbnailList] = useState<string[]>([]);
  const [duration, setDuration] = useState(0);
  const [rulerValues, setRulerValues] = useState<number[]>([]);

  // const timelineRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = document.getElementById('timelineCanvas') as HTMLCanvasElement;

  const [timeline, setTimeline] = useState<Timeline>();
  const rulerRef = useRef<HTMLInputElement>(null);

  const handleLoadMetadata = useCallback(() => {
    if (videoRef && videoRef.current && rulerRef && rulerRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      let count = 0;

      const datumPoint = videoRef.current.duration / 20;

      const thumbnailList: string[] = [];

      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setRulerValues(Array.from([0, 1, 2, 3, 4, 5], (x) => Math.round((x * videoDuration) / 5)));

      if (timelineRef && currentVideoURL) {
        setTimeline(
          new Timeline(timelineRef, {
            totalDuration: videoRef.current.duration + 20,
            thumbnailWidth: 128,
            thumbnailHeight: 120,
            loadingTextureURI: '/images/Loading.png',
            getThumbnailCallback: (time: number, done: (input: any) => void) => {
              // This is strictly for demo purpose and should not be used in prod as it creates as many videos
              // as there are thumbnails all over the timeline.
              const hiddenVideo = document.createElement('video');
              document.body.append(hiddenVideo);
              hiddenVideo.style.display = 'none';

              hiddenVideo.setAttribute('playsinline', '');
              hiddenVideo.muted = true;
              hiddenVideo.autoplay = navigator.userAgent.indexOf('Edge') > 0 ? false : true;
              hiddenVideo.loop = false;

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

              // hiddenVideo.src = '/video/exo.mp4?' + time;
              hiddenVideo.src = currentVideoURL;
              hiddenVideo.load();
            },
          }),
        );

        // timeline.runRenderLoop(() => {
        //   if (videoRef.current && !videoRef.current.paused) {
        //     timeline.setCurrentTime(videoRef.current.currentTime);
        //   }
        // });
      }

      // const checkDuration = setInterval(() => {
      //   if (videoRef.current) {
      //     if (videoRef.current.duration !== Infinity) {
      //       videoRef.current.pause();
      //       videoRef.current.currentTime = 0;
      //       clearInterval(checkDuration);
      //       // setDuration(videoRef.current.duration);

      //       const setScreenshot = setInterval(() => {
      //         if (videoRef.current) {
      //           if (count < 20) {
      //             count++;
      //             const thumbnail = handleCaptureThumbnail();
      //             if (thumbnail) {
      //               thumbnailList.push(thumbnail);
      //             }
      //             videoRef.current.currentTime += datumPoint;
      //           } else {
      //             videoRef.current.currentTime = 0;
      //             setThumbnailList(thumbnailList);
      //             clearInterval(setScreenshot);
      //           }
      //         }
      //       }, 150);
      //     } else {
      //       videoRef.current.currentTime += 1e101;
      //     }
      //   }
      // }, 500);

      setIsVideoLoaded(true);
    }
  }, [currentVideoURL, timelineRef]);

  useEffect(() => {
    if (timeline) {
      timeline.runRenderLoop(() => {
        if (videoRef.current && !videoRef.current.paused) {
          timeline.setCurrentTime(videoRef.current.currentTime);
        }
      });
    }
  }, [timeline]);

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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [number, setNumber] = useState(0);

  const handleChangeCurrentTime = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (timeline && videoRef.current) {
        // timeline.setCurrentTime(number + 1);

        videoRef.current.currentTime = Number(event.target.value);
        // const value = Number(((Number(event.target.value) / duration) * 100).toFixed(3));
        const value = Number(((Number(event.target.value) - 0) * 100) / (duration - 0));
        setNumber(value);
      }
    },
    [duration, timeline],
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
          {/* RP */}
          <canvas className={cx('thumbnail-generator')} ref={canvasRef} />
          <video ref={videoRef} className={cx('video', { mirror: videoRef.current && !videoRef.current.src })} onLoadedMetadata={handleLoadMetadata} {...videoOptions} />
          {cameraDeviceList.length === 0 && !isVideoLoaded && (
            <div className={cx('notification')}>
              <IconWrapper className={cx('icon-no-camera')} icon={SvgPath.NoCamera} />
              <div className={cx('no-camera-text')}>There is no connected camera.</div>
            </div>
          )}
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
          {isVideoLoaded ? (
            // <div className={cx('thumbnail-list')}>
            //   {thumbnailList.map((thumbnail, index) => (
            //     <div className={cx('thumbnail')} key={index}>
            //       <Image src={thumbnail} alt="timeline thumbanil" className={cx('thumbnail-image', 'no-select')} width={100} height={80} />
            //     </div>
            //   ))}
            // </div>
            <Fragment>
              <div className={cx('ruler')}>
                <div className={cx('indicator-wrapper')}>
                  <input
                    ref={rulerRef}
                    className={cx('indicator')}
                    type="range"
                    id="currentTime"
                    min={0}
                    max={duration}
                    step="0.001"
                    value={videoRef.current?.currentTime}
                    onChange={handleChangeCurrentTime}
                  />
                  <label
                    className={cx('indicator-value')}
                    id="currentTime"
                    style={{ left: `${number}%`, transform: `translate(calc(-50% + 16px * (100 - ${number * 2}) / 100), -50%)` }}
                  >
                    {number.toFixed(1)}
                    <div className={cx('indicator-line')} />
                  </label>
                </div>
                <div className={cx('ruler-inner')}>
                  {rulerValues.map((value) => (
                    <div key={value}>{value}s</div>
                  ))}
                </div>
              </div>
              <div className={cx('timeline-wrapper')}>
                <div className={cx('timeline')}>
                  <canvas id="timelineCanvas" className={cx('timeline-canvas')} width={windowWidth - 86 * 2} height={148 - 18 * 2 - 16} />
                </div>
                <input className={cx('scrubber')} type="range" min={0} max={duration} step="0.001" value={videoRef.current?.currentTime} onChange={handleChangeCurrentTime} />
              </div>
            </Fragment>
          ) : (
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
          )}
        </Box>
      </Box>
    </div>
  );
};

export default VideoMode;
