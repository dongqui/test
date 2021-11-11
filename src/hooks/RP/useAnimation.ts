import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useSelector } from 'reducers';
import { filterQuaternion, filterVector } from 'utils/RP';
import { round } from 'lodash';

const useAnimation = () => {
  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const assetList = useSelector((state) => state.shootProject.assetList);
  const visualizedAssetIds = useSelector((state) => state.shootProject.visualizedAssetIds);
  const fps = useSelector((state) => state.shootProject.fps);

  const animationIngredients = useSelector((state) => state.animationData.animationIngredients);

  const playState = useSelector((state) => state.animatingControls.playState);
  const playDirection = useSelector((state) => state.animatingControls.playDirection);
  const playSpeed = useSelector((state) => state.animatingControls.playSpeed);
  const startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);

  const [currentAnimationGroup, setCurrentAnimationGroup] = useState<BABYLON.AnimationGroup>();

  // useEffect(() => {
  //   console.log('animationIngredients: ', animationIngredients);
  // }, [animationIngredients]);

  // useEffect(() => {
  //   console.log('fps: ', fps);
  //   console.log('playState: ', playState);
  //   console.log('playDirection: ', playDirection);
  //   console.log('playSpeed: ', playSpeed);
  //   console.log('startTimeIndex: ', startTimeIndex);
  //   console.log('endTimeIndex: ', endTimeIndex);
  // }, [endTimeIndex, fps, playDirection, playSpeed, playState, startTimeIndex]);

  // 애니메이션 생성
  useEffect(() => {
    const visualizedAnimationIngredients = animationIngredients.filter(
      (animationIngredient) => visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
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
              const newAnimation = new BABYLON.Animation(track.name, `${track.property}`, fps, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
              if (track.useFilter) {
                // filter function 적용
                newAnimation.setKeys(
                  filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta).map((key) => ({ frame: round(key.frame * fps), value: key.value })),
                );
              } else {
                newAnimation.setKeys(track.transformKeys.map((key) => ({ frame: round(key.frame * fps), value: key.value })));
              }
              track.target.animations.push(newAnimation);
              newAnimationGroup.addTargetedAnimation(newAnimation, track.target);
            } else if (track.property === 'rotationQuaternion') {
              const newAnimation = new BABYLON.Animation(
                track.name,
                `${track.property}`,
                fps,
                BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
              );
              if (track.useFilter) {
                // filter function 적용
                newAnimation.setKeys(
                  filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta).map((key) => ({ frame: round(key.frame * fps), value: key.value })),
                );
              } else {
                newAnimation.setKeys(track.transformKeys.map((key) => ({ frame: round(key.frame * fps), value: key.value })));
              }
              track.target.animations.push(newAnimation);
              newAnimationGroup.addTargetedAnimation(newAnimation, track.target);
            }
          }
        }
      });
    });

    setCurrentAnimationGroup(newAnimationGroup);
  }, [animationIngredients, assetList, fps, visualizedAssetIds]);

  // 애니메이션 재생 조작
  useEffect(() => {
    sceneList.forEach((shootScene) => {
      const { id: sceneId, name, scene, canvasId } = shootScene;

      if (currentAnimationGroup) {
        // scene.addAnimationGroup(currentAnimationGroup);

        switch (playState) {
          case 'play': {
            console.log('currentAnimationGroup: ', currentAnimationGroup);
            if (currentAnimationGroup.isStarted) {
              currentAnimationGroup.play(true);
            } else {
              currentAnimationGroup.start(true, playSpeed * playDirection, startTimeIndex, endTimeIndex);
            }
            break;
          }
          case 'pause': {
            console.log('currentAnimationGroup: ', currentAnimationGroup);
            currentAnimationGroup.pause();
            break;
          }
          case 'stop': {
            console.log('currentAnimationGroup: ', currentAnimationGroup);
            currentAnimationGroup.goToFrame(startTimeIndex);
            currentAnimationGroup.stop();
            break;
          }
          default: {
            break;
          }
        }
      }
    });
  }, [currentAnimationGroup, endTimeIndex, fps, playDirection, playSpeed, playState, sceneList, startTimeIndex]);
};

export default useAnimation;
