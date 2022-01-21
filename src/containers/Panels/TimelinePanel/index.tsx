import { memo, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import * as trackListActions from 'actions/trackList';

import TrackList from './TrackList';
import TimelineEditor from './TimelineEditor';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TimelinePanel = () => {
  const dispatch = useDispatch();
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);

  const currentMotionId = useRef('');

  useEffect(() => {
    // viewport에 model이 있는 경우
    if (_visualizedAssetIds.length) {
      const visualizedAnimationIngredients = _animationIngredients.filter(
        (animationIngredient) => _visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
      );
      if (visualizedAnimationIngredients.length !== 0 && currentMotionId.current !== visualizedAnimationIngredients[0].id) {
        dispatch(trackListActions.initializeTrackList({ list: visualizedAnimationIngredients[0].layers, animationIngredientId: visualizedAnimationIngredients[0].id }));
        dispatch(trackListActions.changeSelectedTargets());
        currentMotionId.current = visualizedAnimationIngredients[0].id;
      }
    }
    // viewport에 model이 없는 경우
    else {
      dispatch(trackListActions.initializeTrackList({ list: [], animationIngredientId: '', clearAnimation: true }));
      currentMotionId.current = '';
    }
  }, [_animationIngredients, _visualizedAssetIds, dispatch]);

  return (
    <div className={cx('timeline-panel')}>
      <TrackList />
      <TimelineEditor />
    </div>
  );
};

export default memo(TimelinePanel);
