import { useMemo, useEffect, useState, useCallback, useRef, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { ThinTexture } from '@babylonjs/core/Materials/Textures/thinTexture';
import { Timeline } from '@babylonjs/controls';
import * as globalUIActions from 'actions/Common/globalUI';
import { WARNING_02 } from 'constants/Text';
import Box, { BoxProps } from 'components/Layout/Box';

import { useWindowSize } from 'hooks/common';
import ControlPanel from './ControlPanel';
import RenderingPanel from './RenderingPanel';
import MiddleBar from './MiddleBar';
import TimelinePanel from './TimelinePanel';

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

  const [timeline, setTimeline] = useState<Timeline>();
  const timelineRef = document.getElementById('timelineCanvas') as HTMLCanvasElement;

  const handleLoadMetadata = useCallback(() => {
    if (videoRef && videoRef.current) {
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

  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoStatus, setVideoStatus] = useState<'stop' | 'play' | 'pause'>('stop');

  const handleChangeVideoStatus = useCallback((status: 'stop' | 'play' | 'pause') => {
    setVideoStatus(status);
  }, []);

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
          <RenderingPanel videoRef={videoRef} isVideoLoaded={isVideoLoaded} onLoadMetadata={handleLoadMetadata} />
        </Box>
        <Box id="CP" className={cx('control-panel')} {...boxProps.CP}>
          <ControlPanel />
        </Box>
      </Box>
      <Box id="LS" className={cx('lower-section')} {...boxProps.LS}>
        <Box id="MB" {...boxProps.MB}>
          <MiddleBar videoRef={videoRef} videoStatus={videoStatus} onChange={handleChangeVideoStatus} />
        </Box>
        <Box id="TP" {...boxProps.TP}>
          <TimelinePanel duration={duration} isVideoLoaded={isVideoLoaded} videoStatus={videoStatus} onDrop={handleDrop} timeline={timeline} videoRef={videoRef} />
        </Box>
      </Box>
    </div>
  );
};

export default VideoMode;
