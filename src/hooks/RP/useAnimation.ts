import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as BABYLON from '@babylonjs/core';
import * as trackListActions from 'actions/trackList';
import { useSelector } from 'reducers';
import { filterQuaternion, filterVector } from 'utils/RP';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import { ScaleLinear, TimeIndex } from 'utils/TP';

const useAnimation = () => {
  const dispatch = useDispatch();

  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _fps = useSelector((state) => state.plaskProject.fps);

  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);

  const _playState = useSelector((state) => state.animatingControls.playState);
  const _playDirection = useSelector((state) => state.animatingControls.playDirection);
  const _playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);
  const _currentTimeIndex = useSelector((state) => state.animatingControls.currentTimeIndex);

  const [currentAnimationGroup, setCurrentAnimationGroup] = useState<BABYLON.AnimationGroup>();

  // useEffect(() => {
  //   console.log('animationIngredients: ', animationIngredients);
  // }, [animationIngredients]);

  // 애니메이션 생성
  useEffect(() => {
    const visualizedAnimationIngredients = _animationIngredients.filter(
      (animationIngredient) => _visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
    );

    // 최초 모델 visualize/모델 변경 시, 트랙 리스트 생성 함수 호출
    if (visualizedAnimationIngredients.length) {
      dispatch(trackListActions.initializeTrackList({ list: visualizedAnimationIngredients[0].layers, animationIngredientId: visualizedAnimationIngredients[0].id }));
    } else {
      dispatch(trackListActions.initializeTrackList({ list: [], animationIngredientId: '', clearAnimation: true }));
    }

    const newAnimationGroup = new BABYLON.AnimationGroup('totalAnimationGroup');

    visualizedAnimationIngredients.forEach((animationIngredient) => {
      // layer 고려가 들어가야 함
      // 각 layer의 transformNodes 합해주는 연산 필요
      const { id, name, assetId, tracks, layers } = animationIngredient;
      tracks.forEach((track) => {
        // 비어있는 트랙은 애니메이션 그룹 생성 시 사용하지 않음
        if (track.transformKeys.length > 0) {
          if (track.property !== 'rotation') {
            // rotation track은 단순히 TP내 렌더링 역할만을 하며, 애니메이션 생성 시에는 rotationQuaternion track을 사용
            if (track.isIncluded) {
              if (track.property === 'position' || track.property === 'scaling') {
                const newAnimation = new BABYLON.Animation(
                  track.name,
                  `${track.property}`,
                  _fps,
                  BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                  BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
                );
                if (track.useFilter) {
                  // filter function 적용
                  newAnimation.setKeys(filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta));
                } else {
                  newAnimation.setKeys(track.transformKeys);
                }
                track.target.animations.push(newAnimation);
                newAnimationGroup.addTargetedAnimation(newAnimation, track.target);
              } else if (track.property === 'rotationQuaternion') {
                const newAnimation = new BABYLON.Animation(
                  track.name,
                  `${track.property}`,
                  _fps,
                  BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
                  BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
                );
                if (track.useFilter) {
                  // filter function 적용
                  newAnimation.setKeys(filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta));
                } else {
                  newAnimation.setKeys(track.transformKeys);
                }
                track.target.animations.push(newAnimation);
                newAnimationGroup.addTargetedAnimation(newAnimation, track.target);
              }
            }
          }
        }
      });
    });
    newAnimationGroup.normalize(_startTimeIndex, _endTimeIndex);
    setCurrentAnimationGroup(newAnimationGroup);
  }, [_animationIngredients, _endTimeIndex, _fps, _startTimeIndex, _visualizedAssetIds, dispatch]);

  // 애니메이션 재생 조작
  useEffect(() => {
    _screenList.forEach((PlaskScreen) => {
      const { id: sceneId, scene, canvasId } = PlaskScreen;

      if (currentAnimationGroup) {
        switch (_playState) {
          case 'play': {
            if (currentAnimationGroup.isPlaying) {
              currentAnimationGroup.speedRatio = _playDirection * _playSpeed;
            } else if (currentAnimationGroup.isStarted) {
              currentAnimationGroup.speedRatio = _playDirection * _playSpeed;
              currentAnimationGroup.play();
            } else {
              currentAnimationGroup.start(true, _playDirection * _playSpeed, _startTimeIndex, _endTimeIndex);
            }
            break;
          }
          case 'pause': {
            if (currentAnimationGroup.isPlaying) {
              currentAnimationGroup.pause();
            } else if (currentAnimationGroup.isStarted) {
              if (currentAnimationGroup.animatables[0]?.masterFrame !== _currentTimeIndex) {
                currentAnimationGroup.goToFrame(_currentTimeIndex);
              }
            } else {
              currentAnimationGroup
                .start(true, _playDirection * _playSpeed, _startTimeIndex, _endTimeIndex)
                .pause()
                .goToFrame(_currentTimeIndex);
            }
            break;
          }
          case 'stop': {
            if (currentAnimationGroup.isPlaying) {
              currentAnimationGroup.goToFrame(_startTimeIndex).stop();
            } else if (currentAnimationGroup.isStarted) {
              if (currentAnimationGroup.animatables[0]?.masterFrame !== _currentTimeIndex) {
                currentAnimationGroup.goToFrame(_currentTimeIndex);
              }
            } else {
              currentAnimationGroup
                .start(true, _playDirection * _playSpeed, _startTimeIndex, _endTimeIndex)
                .pause()
                .goToFrame(_currentTimeIndex);
            }
            break;
          }
          default: {
            break;
          }
        }
      }
    });
  }, [_currentTimeIndex, _endTimeIndex, _playDirection, _playSpeed, _playState, _screenList, _startTimeIndex, currentAnimationGroup, dispatch]);

  const scrubberLoopId = useRef(0);
  useEffect(() => {
    const scrubber = document.getElementById('scrubber');
    const scrubberInput = scrubber?.querySelector('input');

    if (scrubber && scrubberInput && currentAnimationGroup) {
      window.cancelAnimationFrame(scrubberLoopId.current);

      const dispatchCurrentTime = (frame: number) => {
        const nextFrame = Math.floor(frame);
        dispatch(animatingControlsActions.moveScrubber({ currentTimeIndex: nextFrame }));
      };

      const translateScrubber = (frame: number) => {
        const scaleX = ScaleLinear.getScaleX();
        const nextFrame = Math.floor(frame);
        if (scaleX) {
          scrubber.setAttribute('transform', `translate(${scaleX(nextFrame)}, 0)`);
          scrubberInput.value = `${nextFrame}`;
        }
      };

      const loopScrubber = () => {
        translateScrubber(currentAnimationGroup.animatables[0].masterFrame);
        scrubberLoopId.current = window.requestAnimationFrame(loopScrubber);
      };

      switch (_playState) {
        case 'play': {
          scrubberLoopId.current = window.requestAnimationFrame(loopScrubber);
          break;
        }
        case 'pause': {
          dispatchCurrentTime(currentAnimationGroup.animatables[0].masterFrame);
          break;
        }
        case 'stop': {
          const startTime = TimeIndex.getStartTimeIndex();
          translateScrubber(startTime);
          dispatchCurrentTime(startTime);
          break;
        }
      }
    }
  }, [_playState, currentAnimationGroup, dispatch]);
};

export default useAnimation;
