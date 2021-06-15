import { VIDEO_FORMAT_TYPES } from 'types';
import _ from 'lodash';
import React, { FunctionComponent, memo, useEffect, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { useRecordWebcam } from '../../../hooks/RP/useRecordWebcam';
import { INITIAL_RECORDING_DATA } from 'utils/const';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import * as pageInfoActions from 'actions/pageInfo';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as recordingDataActions from 'actions/recordingData';
import * as cutImagesActions from 'actions/cutImages';

const cx = classNames.bind(styles);

const RecordWebcam: FunctionComponent = () => {
  const recordingData = useSelector((state) => state.recordingData);

  const dispatch = useDispatch();

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
    if (_.isEqual(status, 'stopped') && mediaBlobUrl && !_.isEmpty(mediaBlobUrl)) {
      dispatch(recordingDataActions.setRecordingData(INITIAL_RECORDING_DATA));
      dispatch(cutImagesActions.setCutImages({ urls: [] }));
      dispatch(
        pageInfoActions.setPageInfo({
          page: 'extract',
          videoUrl: mediaBlobUrl,
          extension: VIDEO_FORMAT_TYPES.mp4,
        }),
      );
    }
  }, [dispatch, mediaBlobUrl, status]);
  return (
    <div className={cx('wrapper')}>
      {recordingData.count && <div className={cx('time')}>{recordingData.count}</div>}
      <video width="100%" height="100%" ref={videoRef} muted></video>
    </div>
  );
};

export default memo(RecordWebcam);
