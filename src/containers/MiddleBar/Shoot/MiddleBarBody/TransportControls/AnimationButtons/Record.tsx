import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as modeSelectionActions from 'actions/modeSelection';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import * as commonActions from 'actions/Common/globalUI';

const cx = classNames.bind(styles);

interface Props {}

const Record: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();

  const handleRecordButtonClick = useCallback(() => {
    dispatch(commonActions.closeModal('GuideModal'));
    localStorage.setItem('onboarding_2', 'onboarding_2');
    dispatch(modeSelectionActions.changeMode({ mode: 'videoMode' }));
  }, [dispatch]);

  return <IconWrapper id="recordButton" className={cx('record')} hasFrame={false} icon={SvgPath.Record} onClick={handleRecordButtonClick} />;
};

export default Record;
