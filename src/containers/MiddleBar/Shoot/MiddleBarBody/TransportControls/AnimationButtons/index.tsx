import { useEffect, Fragment } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import { PlayDirection } from 'types/RP';
import * as animatingControlsActions from 'actions/animatingControlsAction';

import Pause from './Pause';
import Play from './Play';
import Record from './Record';
import Rewind from './Rewind';
import Stop from './Stop';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Buttons = () => {
  const dispatch = useDispatch();

  const playState = useSelector((state) => state.animatingControls.playState);
  const playDirection = useSelector((state) => state.animatingControls.playDirection);
  const startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  const ButtonState = () => {
    const isPlaying = playState === 'play';
    if (isPlaying) {
      if (playDirection === PlayDirection.forward) {
        return (
          <Fragment>
            <Rewind />
            <Pause />
          </Fragment>
        );
      } else {
        return (
          <Fragment>
            <Pause />
            <Play />
          </Fragment>
        );
      }
    } else {
      return (
        <Fragment>
          <Rewind />
          <Play />
        </Fragment>
      );
    }
  };

  // 재생 도중에 model이 변경되거나 clear 될 경우, button 상태를 stop으로 전환
  useEffect(() => {
    dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'stop', currentTimeIndex: startTimeIndex }));
  }, [startTimeIndex, _visualizedAssetIds, dispatch]);

  return (
    <div className={cx('animation-buttons')}>
      <Record />
      <ButtonState />
      <Stop />
    </div>
  );
};

export default Buttons;
