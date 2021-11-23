import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import * as animatingControlsActions from 'actions/animatingControls';
import { TextButton } from 'components/Button';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const AutoKey = () => {
  const dispatch = useDispatch();
  const autokey = useSelector((state) => state.animatingControls.autokey);

  // auto key 버튼 클릭
  const handleAutoKeyButton = useCallback(() => {
    dispatch(animatingControlsActions.clickAutoKeyButton());
  }, [dispatch]);

  return <TextButton text="Autokey" className={cx({ active: autokey })} onClick={handleAutoKeyButton} />;
};

export default AutoKey;
