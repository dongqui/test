import { useEffect, useRef, Fragment, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';

import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { PlayDirection } from 'types/RP';
import { ScaleLinear, TimeIndex } from 'utils/TP';
import plaskEngine from '3d/PlaskEngine';

import Record from './Record';
import Stop from './Stop';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Buttons = () => {
  const dispatch = useDispatch();

  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _playDirection = useSelector((state) => state.animatingControls.playDirection);
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const _playState = useSelector((state) => state.animatingControls.playState);

  const requestAnimationFrameId = useRef(0);

  const playSpeedRef = useRef(PlayDirection.forward);
  useEffect(() => {
    playSpeedRef.current = _playSpeed;
  }, [_playSpeed]);

  // nextFrame이 start ~ end 사이에 있는지 체크
  const clampNextFrame = useCallback((playDirection: PlayDirection) => {
    const nextFrame = TimeIndex.getCurrentTimeIndex() + playDirection * playSpeedRef.current;
    if (playDirection === PlayDirection.forward) {
      return TimeIndex.getEndTimeIndex() < nextFrame ? TimeIndex.getStartTimeIndex() : nextFrame;
    } else {
      return nextFrame < TimeIndex.getStartTimeIndex() ? TimeIndex.getEndTimeIndex() : nextFrame;
    }
  }, []);

  // scrubber 위치 조정
  const translateScrubber = useCallback(
    (playDirection: PlayDirection) => {
      const scrubber = document.getElementById('scrubber');
      const scrubberInput = scrubber?.querySelector('input');
      const scaleX = ScaleLinear.getScaleX();
      if (scrubber && scrubberInput && plaskEngine.animationModule.currentAnimationGroup) {
        const nextFrame =
          plaskEngine.animationModule.currentAnimationGroup.animatables.length !== 0
            ? plaskEngine.animationModule.currentAnimationGroup.animatables[0].masterFrame
            : clampNextFrame(playDirection);
        const digitedNextFrame = playDirection === PlayDirection.forward ? Math.floor(nextFrame) : Math.ceil(nextFrame);
        scrubber.setAttribute('transform', `translate(${scaleX(digitedNextFrame) - 3}, 0)`);
        scrubberInput.value = `${digitedNextFrame}`;
        TimeIndex.setCurrentTimeIndex(nextFrame);
      }
    },
    [clampNextFrame],
  );

  // animation 재생 시 함수 loop
  const loopAnimation = useCallback(
    (playDirection: PlayDirection) => {
      translateScrubber(playDirection);
      requestAnimationFrameId.current = window.requestAnimationFrame(() => loopAnimation(playDirection));
    },
    [translateScrubber],
  );

  //  애니메이션 앞으로 재생 제어
  const editAnimationPlay = useCallback(() => {
    if (plaskEngine.animationModule.currentAnimationGroup) {
      plaskEngine.animationModule.playCurrentAnimationGroup();
      window.cancelAnimationFrame(requestAnimationFrameId.current);
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'play', playDirection: PlayDirection.forward }));
    }
  }, [dispatch]);

  //  애니메이션 뒤로 재생 제어
  const editAnimationRewind = useCallback(() => {
    if (plaskEngine.animationModule.currentAnimationGroup) {
      plaskEngine.animationModule.rewindCurrentAnimationGroup();
      window.cancelAnimationFrame(requestAnimationFrameId.current);
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'play', playDirection: PlayDirection.backward }));
    }
  }, [dispatch]);

  // 애니메이션 일시정지 제어
  const editAnimationPause = useCallback(() => {
    if (plaskEngine.animationModule.currentAnimationGroup && plaskEngine.animationModule.currentAnimationGroup.isPlaying) {
      const masterFrame = Math.floor(plaskEngine.animationModule.currentAnimationGroup.animatables[0].masterFrame);
      plaskEngine.animationModule.pauseCurrentAnimationGroup();
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause', currentTimeIndex: masterFrame }));
    } else {
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause', currentTimeIndex: TimeIndex.getCurrentTimeIndex() }));
    }
    window.cancelAnimationFrame(requestAnimationFrameId.current);
  }, [dispatch]);

  // play 버튼 클릭
  const handlePlayButtonClick = useCallback(() => {
    if (_visualizedAssetIds.length !== 0) {
      editAnimationPlay();
      requestAnimationFrameId.current = window.requestAnimationFrame(() => loopAnimation(PlayDirection.forward));
    }
  }, [_visualizedAssetIds.length, editAnimationPlay, loopAnimation]);

  // rewind 버튼 클릭
  const handleRewindButtonClick = useCallback(() => {
    if (_visualizedAssetIds.length !== 0) {
      editAnimationRewind();
      requestAnimationFrameId.current = window.requestAnimationFrame(() => loopAnimation(PlayDirection.backward));
    }
  }, [_visualizedAssetIds.length, editAnimationRewind, loopAnimation]);

  // pause 버튼 클릭
  const handlePauseButtonClick = useCallback(() => {
    if (_visualizedAssetIds.length !== 0) {
      editAnimationPause();
    }
  }, [_visualizedAssetIds.length, editAnimationPause]);

  // space bar 입력 시, 재생/정시 toggle
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      if (event.key === ' ' && _visualizedAssetIds.length !== 0) {
        if (_playState === 'play') {
          editAnimationPause();
        } else if (_playState === 'pause' || _playState === 'stop') {
          const editPlayDirection = _playDirection === PlayDirection.forward ? editAnimationPlay : editAnimationRewind;
          editPlayDirection();
          requestAnimationFrameId.current = window.requestAnimationFrame(() => loopAnimation(_playDirection));
        }
        // If we dont to that, spacebar presses the current selected button
        event.preventDefault();
      }
    };
    document.addEventListener('keydown', keydownListener);
    return () => {
      document.removeEventListener('keydown', keydownListener);
    };
  }, [_playDirection, _playState, _visualizedAssetIds, dispatch, editAnimationPause, editAnimationPlay, editAnimationRewind, loopAnimation]);

  const ButtonState = useCallback(() => {
    if (_playState === 'play') {
      if (_playDirection === PlayDirection.forward) {
        return (
          <Fragment>
            <IconWrapper id="animationRewindButton" onClick={handleRewindButtonClick} icon={SvgPath.RewindArrow} hasFrame={false} />
            <IconWrapper id="animationPauseButton" className={cx('pause')} onClick={handlePauseButtonClick} icon={SvgPath.Pause} hasFrame={false} />
          </Fragment>
        );
      } else {
        return (
          <Fragment>
            <IconWrapper id="animationPauseButton" className={cx('pause')} onClick={handlePauseButtonClick} icon={SvgPath.Pause} hasFrame={false} />
            <IconWrapper id="animationPlayButton" onClick={handlePlayButtonClick} icon={SvgPath.PlayArrow} hasFrame={false} />
          </Fragment>
        );
      }
    } else {
      return (
        <Fragment>
          <IconWrapper id="animationRewindButton" onClick={handleRewindButtonClick} icon={SvgPath.RewindArrow} hasFrame={false} />
          <IconWrapper id="animationPlayButton" onClick={handlePlayButtonClick} icon={SvgPath.PlayArrow} hasFrame={false} />
        </Fragment>
      );
    }
  }, [_playDirection, _playState, handlePauseButtonClick, handlePlayButtonClick, handleRewindButtonClick]);

  return (
    <div className={cx('animation-buttons')}>
      {/*<Record />*/}
      <ButtonState />
      <Stop requestAnimationFrameId={requestAnimationFrameId} />
    </div>
  );
};

export default Buttons;
