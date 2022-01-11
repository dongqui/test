import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as modeSelectionActions from 'actions/modeSelection';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const Record: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();

  const handleRecordButtonClick = useCallback(() => {
    dispatch(modeSelectionActions.changeMode({ mode: 'videoMode' }));
  }, [dispatch]);

  return <IconWrapper id="recordButton" className={cx('record')} hasFrame={false} icon={SvgPath.Record} onClick={handleRecordButtonClick} />;
};

export default Record;
