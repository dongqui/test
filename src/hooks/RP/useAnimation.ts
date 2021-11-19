import { useEffect, useState } from 'react';
import { useSelector } from 'reducers';
import * as BABYLON from '@babylonjs/core';
import { round } from 'lodash';
import { filterQuaternion, filterVector } from 'utils/RP';

const useAnimation = () => {
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

  useEffect(() => {
    console.log('fps: ', _fps);
    console.log('playState: ', _playState);
    console.log('playDirection: ', _playDirection);
    console.log('playSpeed: ', _playSpeed);
    console.log('startTimeIndex: ', _startTimeIndex);
    console.log('endTimeIndex: ', _endTimeIndex);
  }, [_endTimeIndex, _fps, _playDirection, _playSpeed, _playState, _startTimeIndex]);

  // 애니메이션 생성
  useEffect(() => {
    const visualizedAnimationIngredients = _animationIngredients.filter(
      (animationIngredient) => _visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
    );

    const newAnimationGroup = new BABYLON.AnimationGroup('totalAnimationGroup');

    visualizedAnimationIngredients.forEach((animationIngredient) => {
      // layer 고려가 들어가야 함
      // 각 layer의 transformNodes 합해주는 연산 필요
      const { id, name, assetId, tracks, layers } = animationIngredient;
      tracks.forEach((track) => {
        if (track.property !== 'rotation') {
          // rotation track은 단순히 TP내 렌더링 역할만을 하며, 애니메이션 생성 시에는 rotationQuaternion track을 사용
          if (track.isIncluded) {
            if (track.property === 'position' || track.property === 'scaling') {
              const newAnimation = new BABYLON.Animation(track.name, `${track.property}`, _fps, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
              if (track.useFilter) {
                // filter function 적용
                newAnimation.setKeys(
                  filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta).map((key) => ({ frame: round(key.frame * _fps), value: key.value })),
                );
              } else {
                newAnimation.setKeys(track.transformKeys.map((key) => ({ frame: round(key.frame * _fps), value: key.value })));
              }
              track.target.animations.push(newAnimation);
              newAnimationGroup.addTargetedAnimation(newAnimation.clone(), track.target);
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
                newAnimation.setKeys(
                  filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta).map((key) => ({ frame: round(key.frame * _fps), value: key.value })),
                );
              } else {
                newAnimation.setKeys(track.transformKeys.map((key) => ({ frame: round(key.frame * _fps), value: key.value })));
              }
              track.target.animations.push(newAnimation);
              newAnimationGroup.addTargetedAnimation(newAnimation.clone(), track.target);
            }
          }
        }
      });
    });
    // newAnimationGroup.normalize(_startTimeIndex, _endTimeIndex);
    setCurrentAnimationGroup(newAnimationGroup);
  }, [_animationIngredients, _endTimeIndex, _fps, _startTimeIndex, _visualizedAssetIds]);

  // 애니메이션 재생 조작
  useEffect(() => {
    _screenList.forEach((PlaskScreen) => {
      const { id: sceneId, scene, canvasId } = PlaskScreen;

      if (currentAnimationGroup) {
        switch (_playState) {
          case 'play': {
            if (currentAnimationGroup.isStarted) {
              currentAnimationGroup.speedRatio = _playSpeed * _playDirection;
              currentAnimationGroup.play(true);
            } else {
              currentAnimationGroup.start(true, _playSpeed * _playDirection, _startTimeIndex, _endTimeIndex);
            }
            break;
          }
          case 'pause': {
            currentAnimationGroup.pause();
            break;
          }
          case 'stop': {
            currentAnimationGroup.pause();
            currentAnimationGroup.goToFrame(_startTimeIndex);
            break;
          }
          default: {
            break;
          }
        }
      }
    });
  }, [currentAnimationGroup, _endTimeIndex, _playDirection, _playSpeed, _playState, _screenList, _startTimeIndex]);
};

export default useAnimation;
