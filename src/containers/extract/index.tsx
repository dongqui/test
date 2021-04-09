import { FunctionComponent, Fragment, memo } from 'react';
import { useReactiveVar } from '@apollo/client';
import * as S from './ExtractStyle';
import { Webcam } from 'containers/extract/Webcam';
import CutEdit from 'containers/extract/CutEdit';
import { ExtractPlayBar } from 'containers/extract/ExtractPlayBar';
import { storePageInfo } from 'lib/store';
import { DEFAULT_FILE_URL } from 'utils/const';
import MiddleBar from 'containers/New_MiddleBar';
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
      {/* <S.WebcamWrapper>
        <Webcam videoUrl={videoURL} />
      </S.WebcamWrapper>
      <ExtractPlayBar />
      <S.CutEditWrapper>
        <CutEdit />
      </S.CutEditWrapper> */}
    </Fragment>
  );
};

export default memo(Extract);
