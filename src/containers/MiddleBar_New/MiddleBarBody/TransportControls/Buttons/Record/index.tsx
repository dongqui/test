import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import _ from 'lodash';
import { IconWrapper, SvgPath } from 'components/Icon';
import fnDetectSafari from 'utils/common/fnDetectSafari';
import sleep from 'utils/common/sleep';
import { PAGE_NAMES } from 'types';
import * as pageInfoActions from 'actions/pageInfo';
import * as recordingDataActions from 'actions/recordingData';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Record: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const recordingData = useSelector((state) => state.recordingData);
  const pageInfo = useSelector((state) => state.pageInfo);

  const handleRecord = useCallback(async () => {
    if (fnDetectSafari()) {
      return;
    }
    if (!_.isEqual(pageInfo.page, PAGE_NAMES.record)) {
      dispatch(pageInfoActions.setPageInfo({ page: 'record' }));
      return;
    }
    if (_.isUndefined(recordingData.count)) {
      if (!recordingData.isRecording) {
        for (const count of [5, 4, 3, 2, 1]) {
          dispatch(recordingDataActions.setRecordingData({ ...recordingData, count }));
          await sleep(1000);
        }
      }
      dispatch(
        recordingDataActions.setRecordingData({
          ...recordingData,
          isRecording: !recordingData.isRecording,
          count: undefined,
        }),
      );
    }
  }, [dispatch, pageInfo.page, recordingData]);

  const recordButtonClasses = cx('record', {
    isRecording: recordingData.isRecording,
  });

  return (
    <IconWrapper
      className={recordButtonClasses}
      hasFrame={false}
      icon={SvgPath.Record}
      onClick={handleRecord}
    />
  );
};

export default Record;
