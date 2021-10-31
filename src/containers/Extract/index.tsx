import { FunctionComponent, Fragment, memo, useEffect } from 'react';
import CutEdit from 'containers/Extract/CutEdit';
import MiddleBar from 'containers/MiddleBar';
import Webcam from 'containers/Extract/Webcam';
import _ from 'lodash';
import { PAGE_NAMES } from 'types';
import RecordWebcam from 'containers/Extract/RecordWebcam';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Extract: FunctionComponent = () => {
  const pageInfo = useSelector((state) => state.pageInfo);

  const videoURL = pageInfo.videoUrl;

  return (
    <Fragment>
      <div className={cx('wrapper')}>
        <div className={cx('upper-section')}>
          {_.isEqual(pageInfo?.page, PAGE_NAMES.record) && <RecordWebcam />}
          {_.isEqual(pageInfo?.page, PAGE_NAMES.extract) && videoURL && (
            <Webcam videoUrl={videoURL} />
          )}
        </div>
        <MiddleBar />
        <div className={cx('lower-section')}>
          {_.isEqual(pageInfo?.page, PAGE_NAMES.extract) && <CutEdit />}
        </div>
      </div>
    </Fragment>
  );
};

export default memo(Extract);
