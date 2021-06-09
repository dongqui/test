import * as barPositionXActions from 'actions/barPositionX';
import * as cutImagesActions from 'actions/cutImages';
import * as recordingDataActions from 'actions/recordingData';
import getBlobDuration from 'get-blob-duration';
import useVideoToImages from 'hooks/RP/useVideoToImages';
import _ from 'lodash';
import React, { FunctionComponent, memo, useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { WebcamPresenter } from './Webcam';

export interface WebcamProps {
  videoUrl: string;
}

const WebcamComponent: FunctionComponent<WebcamProps> = ({ videoUrl }) => {
  const recordingData = useSelector((state) => state.recordingData);
  const cutImages = useSelector((state) => state.cutImages.urls);

  const dispatch = useDispatch();

  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideoRef = useRef<HTMLVideoElement>(null);
  const initialAction = useCallback(async () => {
    const video = showVideoRef.current;
    if (!_.isNull(video)) {
      const duration = await getBlobDuration(videoUrl);
      dispatch(recordingDataActions.setRecordingData({ ...recordingData, duration }));
      dispatch(cutImagesActions.setCutImages({ urls: [] }));
    }
  }, [dispatch, recordingData, videoUrl]);
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
      const startTime = recordingData.duration * (recordingData.rangeBoxInfo.x / window.innerWidth);
      const endTime =
        recordingData.duration *
        ((recordingData.rangeBoxInfo.x + recordingData.rangeBoxInfo.width) / window.innerWidth);
      let barX = window.innerWidth * (currentTime / recordingData.duration);
      if (_.gt(currentTime, endTime)) {
        if (showVideoRef?.current) {
          showVideoRef.current.currentTime = startTime;
          barX = recordingData.rangeBoxInfo.x;
        }
      }
      dispatch(barPositionXActions.setBarPositionX({ x: barX }));
    }
  }, [
    dispatch,
    recordingData.duration,
    recordingData?.isPlaying,
    recordingData.rangeBoxInfo.width,
    recordingData.rangeBoxInfo.x,
  ]);
  useVideoToImages({
    videoRef,
    videoUrl,
    action: ({ images }) => {
      if (_.isEmpty(cutImages)) {
        dispatch(cutImagesActions.setCutImages({ urls: images }));
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
        recordingData.duration * (recordingData.rangeBoxInfo.barX / window.innerWidth);
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

export default memo(WebcamComponent);
