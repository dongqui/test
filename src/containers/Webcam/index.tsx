import { useReactiveVar } from '@apollo/client';
import { useVideoToImages } from 'hooks/RP/useVideoToImages';
import { RECORDING_DATA_TYPES } from 'interfaces/RP';
import { RECORDING_DATA } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import * as S from './WebcamStyles';

export interface WebcamProps {
  videoUrl: string;
}

const WebcamComponent: React.FC<WebcamProps> = ({ videoUrl }) => {
  const recordingData = useReactiveVar(RECORDING_DATA);
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideoRef = useRef<HTMLVideoElement>(null);
  // useVideoToImages({
  //   videoRef,
  //   action: ({ images }) => {
  //     RECORDING_DATA({ ...recordingData, cutImages: images });
  //   },
  // });
  const initialAction = useCallback(async () => {
    const video = showVideoRef.current;
    if (!_.isNull(video)) {
      if (video?.paused) {
        await video.play();
        await video.pause();
      }
      video.currentTime = 0;
      RECORDING_DATA({ ...recordingData, duration: video.duration });
    }
  }, [recordingData]);
  const controlPlay = useCallback(
    async ({ isPlay }) => {
      const video = showVideoRef.current;
      if (recordingData.isPlay) {
        await video?.play();
      } else {
        await video?.pause();
      }
    },
    [recordingData.isPlay],
  );
  useEffect(() => {
    controlPlay({ isPlay: recordingData.isPlay });
  }, [controlPlay, recordingData.isPlay]);
  useEffect(() => {
    initialAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <S.WebcamSubWrapper ref={videoRef} muted src={videoUrl}>
        <track kind="captions" />
      </S.WebcamSubWrapper>
      <S.WebcamWrapper ref={showVideoRef} muted src={videoUrl}>
        <track kind="captions" />
      </S.WebcamWrapper>
    </>
  );
};
export const Webcam = React.memo(WebcamComponent);
