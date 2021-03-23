import { useReactiveVar } from '@apollo/client';
import { PAGE_NAMES, VIDEO_FORMAT_TYPES } from 'types';
import { storeCutImages, storeRecordingData } from 'lib/store';
import _ from 'lodash';
import moment, { Moment } from 'moment';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useRef, useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useRecordWebcam } from '../../hooks/RP/useRecordWebcam';
import * as S from './RecordStyle';
import { INITIAL_CP_DATA, INITIAL_RECORDING_DATA } from 'utils/const';

let time = { start: moment(), end: moment() };
const RecordWebcam: React.FC = () => {
  const router = useRouter();
  const recordingData = useReactiveVar(storeRecordingData);
  const videoRef = useRef<HTMLVideoElement>(null);
  useRecordWebcam({ ref: videoRef });
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    video: true,
  });
  useEffect(() => {
    if (!_.isUndefined(recordingData.isRecording)) {
      if (recordingData.isRecording) {
        startRecording();
        time = { ...time, start: moment() };
      } else {
        stopRecording();
        time = { ...time, end: moment() };
      }
    }
  }, [mediaBlobUrl, recordingData.isRecording, router, startRecording, stopRecording]);
  useEffect(() => {
    if (_.isEqual(status, 'stopped') && !_.isEmpty(mediaBlobUrl)) {
      storeRecordingData(INITIAL_RECORDING_DATA);
      storeCutImages([]);
      router.push(
        `/${PAGE_NAMES.extract}?videoUrl=${mediaBlobUrl}&extension=${
          VIDEO_FORMAT_TYPES.mp4
        }&duration=${time.end.diff(time.start) / 1000}`,
        undefined,
        {
          shallow: true,
        },
      );
    }
  }, [mediaBlobUrl, router, status]);
  return (
    <S.VideoWrapper>
      {recordingData.count && <S.VideoTimerWrapper>{recordingData.count}</S.VideoTimerWrapper>}
      <video width="100%" height="100%" ref={videoRef} muted></video>
    </S.VideoWrapper>
  );
};

export default React.memo(RecordWebcam);
