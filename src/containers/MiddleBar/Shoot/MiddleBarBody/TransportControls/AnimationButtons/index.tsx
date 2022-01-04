import { useEffect, useRef, Fragment, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as animatingControlsActions from 'actions/animatingControlsAction';
import { IconWrapper, SvgPath } from 'components/Icon';
import { useSelector } from 'reducers';
import { PlayDirection } from 'types/RP';
import { ScaleLinear, TimeIndex } from 'utils/TP';

import Record from './Record';
import Stop from './Stop';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Buttons = () => {
  const dispatch = useDispatch();

  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);
  const _playDirection = useSelector((state) => state.animatingControls.playDirection);
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);
  const _currentTimeIndex = useSelector((state) => state.animatingControls.currentTimeIndex);

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
      if (scrubber && scrubberInput && _currentAnimationGroup) {
        const nextFrame = _currentAnimationGroup.animatables.length !== 0 ? _currentAnimationGroup.animatables[0].masterFrame : clampNextFrame(playDirection);
        const digitedNextFrame = playDirection === PlayDirection.forward ? Math.floor(nextFrame) : Math.ceil(nextFrame);
        scrubber.setAttribute('transform', `translate(${scaleX(digitedNextFrame) - 3}, 0)`);
        scrubberInput.value = `${digitedNextFrame}`;
        TimeIndex.setCurrentTimeIndex(nextFrame);
      }
    },
    [_currentAnimationGroup, clampNextFrame],
  );

  // animation 재생 시 함수 loop
  const loopAnimation = useCallback(
    (playDirection: PlayDirection) => {
      translateScrubber(playDirection);
      requestAnimationFrameId.current = window.requestAnimationFrame(() => loopAnimation(playDirection));
    },
    [translateScrubber],
  );

  // 애니메이션 앞으로 재생 제어
  const editAnimationPlay = useCallback(() => {
    if (_currentAnimationGroup) {
      if (_currentAnimationGroup.isPlaying && _currentAnimationGroup.speedRatio < 0) {
        _currentAnimationGroup.speedRatio = _playSpeed;
      } else if (_currentAnimationGroup.isStarted) {
        _currentAnimationGroup.speedRatio = _playSpeed;
        _currentAnimationGroup.play().goToFrame(_currentTimeIndex);
      } else {
        _currentAnimationGroup.start(true, _playSpeed, _startTimeIndex, _endTimeIndex).goToFrame(_currentTimeIndex - _startTimeIndex);
      }
      window.cancelAnimationFrame(requestAnimationFrameId.current);
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'play', playDirection: PlayDirection.forward }));
    }
  }, [_currentAnimationGroup, _currentTimeIndex, _endTimeIndex, _playSpeed, _startTimeIndex, dispatch]);

  // 애니메이션 뒤로 재생 제어
  const editAnimationRewind = useCallback(() => {
    if (_currentAnimationGroup) {
      if (_currentAnimationGroup.isPlaying && _currentAnimationGroup.speedRatio >= 0) {
        _currentAnimationGroup.speedRatio = -1 * _playSpeed;
      } else if (_currentAnimationGroup.isStarted) {
        _currentAnimationGroup.speedRatio = -1 * _playSpeed;
        _currentAnimationGroup.play().goToFrame(_currentTimeIndex);
      } else {
        _currentAnimationGroup.start(true, -1 * _playSpeed, _startTimeIndex, _endTimeIndex).goToFrame(_currentTimeIndex - _startTimeIndex);
      }
      window.cancelAnimationFrame(requestAnimationFrameId.current);
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'play', playDirection: PlayDirection.backward }));
    }
  }, [_currentAnimationGroup, _currentTimeIndex, _endTimeIndex, _playSpeed, _startTimeIndex, dispatch]);

  // 애니메이션 일시정지 제어
  const editAnimationPause = useCallback(() => {
    if (_currentAnimationGroup && _currentAnimationGroup.isPlaying) {
      const masterFrame = Math.floor(_currentAnimationGroup.animatables[0].masterFrame);
      _currentAnimationGroup.pause();
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause', currentTimeIndex: masterFrame }));
    } else {
      dispatch(animatingControlsActions.clickPlayStateButton({ playState: 'pause', currentTimeIndex: TimeIndex.getCurrentTimeIndex() }));
    }
    window.cancelAnimationFrame(requestAnimationFrameId.current);
  }, [_currentAnimationGroup, dispatch]);

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
      }
    };
    document.addEventListener('keydown', keydownListener);
    return () => {
      document.removeEventListener('keydown', keydownListener);
    };
  }, [_playDirection, _playState, _visualizedAssetIds, dispatch, editAnimationPause, editAnimationPlay, editAnimationRewind, loopAnimation]);

  const ButtonState = () => {
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
  };

  return (
    <div className={cx('animation-buttons')}>
      <Record />
      <ButtonState />
      <Stop requestAnimationFrameId={requestAnimationFrameId} />
    </div>
  );
};

export default Buttons;
