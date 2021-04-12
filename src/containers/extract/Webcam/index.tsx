import { useReactiveVar } from '@apollo/client';
import getBlobDuration from 'get-blob-duration';
import { useVideoToImages } from 'hooks/RP/useVideoToImages';
import { storeBarPositionX, storeRecordingData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useEffect, useRef } from 'react';
import { STANDARD_WIDTH } from 'styles/constants/common';
import { storeCutImages } from '../../../lib/store';
import { WebcamPresenter } from './WebcamPresenter';
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
      const duration = await getBlobDuration(videoUrl);
      storeRecordingData({ ...recordingData, duration });
      storeCutImages([]);
    }
  }, [recordingData, videoUrl]);
  const controlPlay = useCallback(async () => {
    const video = showVideoRef.current;
    if (video && recordingData.isPlaying) {
      await video?.play();
    } else {
      await video?.pause();
    }
  }, [recordingData.isPlaying]);
  const handleTimeUpdate = useCallback(() => {
    if (recordingData?.isPlaying) {
      const currentTime = showVideoRef?.current?.currentTime ?? 0;
      const startTime = recordingData.duration * (recordingData.rangeBoxInfo.x / STANDARD_WIDTH);
      const endTime =
        recordingData.duration *
        ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / STANDARD_WIDTH);
      let barX = STANDARD_WIDTH * (currentTime / recordingData.duration);
      if (_.gt(currentTime, endTime)) {
        if (showVideoRef?.current) {
          showVideoRef.current.currentTime = startTime;
          barX = recordingData.rangeBoxInfo.x;
        }
      }
      storeBarPositionX(barX);
    }
  }, [recordingData]);
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
    if (showVideoRef?.current) {
      showVideoRef.current.ontimeupdate = handleTimeUpdate;
    }
  }, [handleTimeUpdate]);
  useEffect(() => {
    initialAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <WebcamPresenter showVideoRef={showVideoRef} videoRef={videoRef} videoUrl={videoUrl} />;
};
export const Webcam = React.memo(WebcamComponent);
