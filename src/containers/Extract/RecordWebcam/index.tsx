import { useReactiveVar } from '@apollo/client';
import { PAGE_NAMES, VIDEO_FORMAT_TYPES } from 'types';
import { storeCutImages, storePageInfo, storeRecordingData } from 'lib/store';
import _ from 'lodash';
import React, { useEffect, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useRecordWebcam } from '../../../hooks/RP/useRecordWebcam';
import { DEFAULT_FILE_URL, INITIAL_RECORDING_DATA } from 'utils/const';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const RecordWebcam: React.FC = () => {
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
      } else {
        stopRecording();
      }
    }
  }, [mediaBlobUrl, recordingData.isRecording, startRecording, stopRecording]);
  useEffect(() => {
    if (_.isEqual(status, 'stopped') && !_.isEmpty(mediaBlobUrl)) {
      storeRecordingData(INITIAL_RECORDING_DATA);
      storeCutImages([]);
      storePageInfo({
        page: PAGE_NAMES.extract,
        videoUrl: mediaBlobUrl ?? DEFAULT_FILE_URL,
        extension: VIDEO_FORMAT_TYPES.mp4,
      });
    }
  }, [mediaBlobUrl, status]);
  return (
    <div className={cx('wrapper')}>
      {recordingData.count && <div className={cx('time')}>{recordingData.count}</div>}
      <video width="100%" height="100%" ref={videoRef} muted></video>
    </div>
  );
};

export default React.memo(RecordWebcam);
