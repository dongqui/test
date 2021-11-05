import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

// import { addLayerTrack } from 'actions/trackList';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const DopeSheetHeader = () => {
  const dispatch = useDispatch();

  const handlePlusButtonClick = useCallback(() => {
    // dispatch(addLayerTrack({ trackName: 'ddd' }));
  }, []);

  return (
    <div className={cx('dope-sheet-header')}>
      <span>Layers</span>
      <IconWrapper icon={SvgPath.Plus} className={cx('plus')} onClick={handlePlusButtonClick} />
    </div>
  );
};

export default DopeSheetHeader;
