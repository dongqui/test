import { useReactiveVar } from '@apollo/client';
import { useVideoToImages } from 'hooks/RP/useVideoToImages';
import { RECORDING_DATA } from 'lib/store';
import _ from 'lodash';
import { useRouter } from 'next/dist/client/router';
import React, { useCallback, useEffect, useRef } from 'react';
import { STANDARD_WIDTH } from 'styles/constants/common';
import { CUT_IMAGES_CNT } from 'utils/const';
import { CUT_IMAGES } from '../../lib/store';
import * as S from './WebcamStyles';

export interface WebcamProps {
  videoUrl: string;
}
const WebcamComponent: React.FC<WebcamProps> = ({ videoUrl }) => {
  const router = useRouter();
  const recordingData = useReactiveVar(RECORDING_DATA);
  const cutImages = useReactiveVar(CUT_IMAGES);
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
      RECORDING_DATA({ ...recordingData, duration: video.duration });
    }
  }, [recordingData]);
  const controlPlay = useCallback(async () => {
    const video = showVideoRef.current;
    if (recordingData.isPlay) {
      await video?.play();
    } else {
      if (!_.isNull(video)) {
        video.currentTime = 0;
      }
      await video?.pause();
    }
  }, [recordingData.isPlay]);
  useVideoToImages({
    videoRef,
    action: ({ images }) => {
      if (_.isEmpty(cutImages)) {
        CUT_IMAGES(images);
      }
    },
    active: _.isEmpty(cutImages),
    intervalTime: ((videoRef.current?.duration ?? 10) / CUT_IMAGES_CNT) * 1000,
  });
  useEffect(() => {
    controlPlay();
  }, [controlPlay, recordingData.isPlay]);
  useEffect(() => {
    const newCurrentTime =
      recordingData.duration * (recordingData.rangeBoxInfo.barX / STANDARD_WIDTH);
    const video = showVideoRef.current;
    if (!_.isNull(video)) {
      video.currentTime = newCurrentTime;
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
