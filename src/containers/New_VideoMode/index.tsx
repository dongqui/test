import { Fragment, useMemo, useEffect, useState, useCallback, useRef, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Timeline } from '@babylonjs/controls';
import * as globalUIActions from 'actions/Common/globalUI';
import { WARNING_02 } from 'constants/Text';
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

  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentVideoURL, setVideoURL] = useState<string>();

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
  const [rulerValues, setRulerValues] = useState<number[]>([]);

  const timelineRef = document.getElementById('timelineCanvas') as HTMLCanvasElement;

  const [startValue, setStartValue] = useState(0);
  const [endValue, setEndValue] = useState(0);
  const [sliderStyles, setSliderStyles] = useState<{
    left: number;
    right: number;
    width: number;
  }>({
    left: 0,
    right: 100,
    width: 100,
  });

  const [timeline, setTimeline] = useState<Timeline>();
  const rulerRef = useRef<HTMLInputElement>(null);

  const handleLoadMetadata = useCallback(() => {
    if (videoRef && videoRef.current && rulerRef && rulerRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;

      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndValue(videoDuration);
      setRulerValues(Array.from([0, 1, 2, 3, 4, 5], (x) => Math.round((x * videoDuration) / 5)));

      if (timelineRef && currentVideoURL) {
        setTimeline(
          new Timeline(timelineRef, {
            totalDuration: videoRef.current.duration + 20,
            thumbnailWidth: 128,
            thumbnailHeight: 96,
            loadingTextureURI: '/images/Loading.png',
            getThumbnailCallback: (time: number, done: (input: any) => void) => {
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

              hiddenVideo.src = currentVideoURL;
              hiddenVideo.load();
            },
          }),
        );
      }

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

  const [cameraDeviceList, setCameraDeviceList] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [number, setNumber] = useState(0);

  const handleChangeCurrentTime = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (timeline && videoRef.current) {
        videoRef.current.currentTime = Number(event.target.value);
        const value = Number(((Number(event.target.value) - 0) * 100) / (duration - 0));
        setNumber(value);
      }
    },
    [duration, timeline],
  );

  const handleChangeStartValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(((Number(event.target.value) - 0) * 100) / (duration - 0));

      if (Number(event.target.value) < endValue - 1) {
        setStartValue(Number(event.target.value));
        setSliderStyles({
          left: value,
          right: sliderStyles.right,
          width: sliderStyles.width - (value - sliderStyles.left),
        });
      }
    },
    [duration, endValue, sliderStyles.left, sliderStyles.right, sliderStyles.width],
  );

  const handleChangeEndValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(((Number(event.target.value) - 0) * 100) / (duration - 0));

      if (Number(event.target.value) > startValue + 1) {
        setEndValue(Number(event.target.value));
        setSliderStyles({
          left: sliderStyles.left,
          right: value,
          width: sliderStyles.width - (sliderStyles.right - value),
        });
      }
    },
    [duration, sliderStyles.left, sliderStyles.right, sliderStyles.width, startValue],
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
          <canvas className={cx('thumbnail-generator')} ref={canvasRef} />
          <video ref={videoRef} className={cx('video', { mirror: videoRef.current && !videoRef.current.src })} onLoadedMetadata={handleLoadMetadata} autoPlay playsInline muted />
          {cameraDeviceList.length === 0 && !isVideoLoaded && (
            <div className={cx('notification')}>
              <IconWrapper className={cx('icon-no-camera')} icon={SvgPath.NoCamera} />
              <div className={cx('no-camera-text')}>There is no connected camera.</div>
            </div>
          )}
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
          {isVideoLoaded ? (
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
                    {((duration * Number(number.toFixed(1))) / 100).toFixed(1)}
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
                  <canvas id="timelineCanvas" className={cx('timeline-canvas')} />
                  <input className={cx('scrubber')} type="range" min={0} max={duration} step="0.001" value={videoRef.current?.currentTime} onChange={handleChangeCurrentTime} />
                  <input className={cx('crop-slider-start')} type="range" min={0} max={duration} step="0.001" value={startValue} onChange={handleChangeStartValue} />
                  <input className={cx('crop-slider-end')} type="range" min={0} max={duration} step="0.001" value={endValue} onChange={handleChangeEndValue} />
                  <div className={cx('slider-time')} style={{ left: `calc(${sliderStyles.left}%)`, width: `calc(${sliderStyles.width}%)` }} />
                </div>
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
