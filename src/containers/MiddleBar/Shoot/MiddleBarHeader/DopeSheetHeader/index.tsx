import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as trackListActions from 'actions/trackList';
import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import { IconButton } from 'components/Button';
import { ONBOARDING_ID } from 'containers/Onboarding/id';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const DopeSheetHeader = () => {
  const animationIngredientId = useSelector((state) => state.trackList.animationIngredientId);
  const dispatch = useDispatch();

  const handleAddLayerTrackButton = useCallback(() => {
    if (animationIngredientId) {
      dispatch(trackListActions.clickAddLayerTrackButton());
    }
  }, [dispatch, animationIngredientId]);

  return (
    <div className={cx('dope-sheet-header')}>
      <span id={ONBOARDING_ID.EDIT_KEYFRAME}>Layers</span>
      <IconButton icon={SvgPath.Plus} type="ghost" onClick={handleAddLayerTrackButton} />
    </div>
  );
};

export default DopeSheetHeader;
