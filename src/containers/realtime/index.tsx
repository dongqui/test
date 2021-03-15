import { FunctionComponent, memo, useCallback, useState } from 'react';
import _ from 'lodash';
import WebcamPanel from './Webcam';
import Model from './Model';
import { getDummyData } from 'utils/RT/getDummyData';
import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

type RecordStatus = 'START' | 'END';

const RealtimeContainer: FunctionComponent = () => {
  // const handleRetarget = useCallback(() => {
  //   console.log('handleRetarget');
  // }, []);

  const [isStart, setIsStart] = useState(false);
  const [retargetedData, setRetargetedData] = useState<any[]>([]);

  const handleStart = useCallback((status: RecordStatus) => {
    const isRecording = _.isEqual(status, 'START');

    setIsStart(isRecording);
    setRetargetedData(getDummyData);
  }, []);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('model')}>
        <Model isStart={isStart} data={retargetedData} />
      </div>
      <WebcamPanel isStart={isStart} onStart={handleStart} />
    </div>
  );
};

export default memo(RealtimeContainer);
