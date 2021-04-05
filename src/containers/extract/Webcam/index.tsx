import { useReactiveVar } from '@apollo/client';
import getBlobDuration from 'get-blob-duration';
import { useVideoToImages } from 'hooks/RP/useVideoToImages';
import { storeRecordingData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { STANDARD_WIDTH } from 'styles/constants/common';
import { storeCutImages } from '../../../lib/store';
import * as S from './WebcamStyles';

export interface WebcamProps {
  videoUrl: string;
}
const WebcamComponent: React.FC<WebcamProps> = ({ videoUrl }) => {
  const recordingData = useReactiveVar(storeRecordingData);
  const cutImages = useReactiveVar(storeCutImages);
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideoRef = useRef<HTMLVideoElement>(null);
  const initialAction = useCallback(async () => {
    const video = showVideoRef.current;
    if (!_.isNull(video)) {
      if (video?.paused) {
        await video.play();
        video.currentTime = 0;
        await video.pause();
      }
      const duration = await getBlobDuration(videoUrl);
      storeRecordingData({ ...recordingData, duration });
      storeCutImages([]);
    }
  }, [recordingData, videoUrl]);
  const controlPlay = useCallback(async () => {
    const video = showVideoRef.current;
    if (recordingData.isPlaying) {
      await video?.play();
    } else {
      if (!_.isNull(video)) {
        video.currentTime = 0;
      }
      await video?.pause();
    }
  }, [recordingData.isPlaying]);
  useVideoToImages({
    videoRef,
    videoUrl,
    action: ({ images }) => {
      if (_.isEmpty(cutImages)) {
        storeCutImages(images);
      }
    },
    active: _.isEmpty(cutImages),
  });
  useEffect(() => {
    controlPlay();
  }, [controlPlay]);
  useEffect(() => {
    try {
      const newCurrentTime =
        recordingData.duration * (recordingData.rangeBoxInfo.barX / STANDARD_WIDTH);
      const video = showVideoRef.current;
      if (!_.isNull(video)) {
        video.currentTime = newCurrentTime;
      }
    } catch (error) {
      console.log('error', error);
    }
  }, [recordingData.duration, recordingData.rangeBoxInfo.barX]);
  useEffect(() => {
    initialAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <S.WebcamSubWrapper ref={videoRef} muted src={videoUrl}>
        <track kind="captions" />
      </S.WebcamSubWrapper>
      <S.WebcamWrapper ref={showVideoRef} muted src={videoUrl} controls>
        <track kind="captions" />
      </S.WebcamWrapper>
    </>
  );
};
export const Webcam = React.memo(WebcamComponent);
