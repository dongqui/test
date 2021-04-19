import { FunctionComponent, Fragment, memo, useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import CutEdit from 'containers/extract/CutEdit';
import { storeCutImages, storePageInfo } from 'lib/store';
import MiddleBar from 'containers/New_MiddleBar';
import Webcam from 'containers/extract/Webcam';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Extract: FunctionComponent = () => {
  const pageInfo = useReactiveVar(storePageInfo);

  const videoURL = pageInfo.videoUrl;

  return (
    <Fragment>
      <div className={cx('wrapper')}>
        <div className={cx('upper-section')}>{videoURL && <Webcam videoUrl={videoURL} />}</div>
        <MiddleBar />
        <div className={cx('lower-section')}>
          <CutEdit />
        </div>
      </div>
    </Fragment>
  );
};

export default memo(Extract);
