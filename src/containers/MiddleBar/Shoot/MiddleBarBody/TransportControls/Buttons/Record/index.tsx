import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import fnDetectSafari from 'utils/common/fnDetectSafari';
import * as pageInfoActions from 'actions/pageInfo';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Record = () => {
  const dispatch = useDispatch();

  const handleRecord = useCallback(() => {
    if (fnDetectSafari()) return;
    dispatch(pageInfoActions.setPageInfo({ page: 'record' }));
  }, [dispatch]);

  return (
    <IconWrapper
      className={cx('record')}
      hasFrame={false}
      icon={SvgPath.Record}
      onClick={handleRecord}
    />
  );
};

export default Record;
