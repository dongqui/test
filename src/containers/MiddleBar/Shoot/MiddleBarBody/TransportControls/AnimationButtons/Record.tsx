import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import { detectSafari } from 'utils/common';
import * as modeSelectionActions from 'actions/modeSelection';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Record = () => {
  const dispatch = useDispatch();

  const handleRecord = useCallback(() => {
    if (detectSafari()) return;
    dispatch(modeSelectionActions.changeMode({ mode: 'videoMode' }));
  }, [dispatch]);

  return <IconWrapper className={cx('record')} hasFrame={false} icon={SvgPath.Record} onClick={handleRecord} />;
};

export default Record;
