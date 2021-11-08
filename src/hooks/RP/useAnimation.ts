import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useSelector } from 'reducers';

const useAnimation = () => {
  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const assetList = useSelector((state) => state.shootProject.assetList);
  const visualizedAssetIds = useSelector((state) => state.shootProject.visualizedAssetIds);
  const fps = useSelector((state) => state.shootProject.fps);

  const animationIngredients = useSelector((state) => state.animationData.animationIngredients);

  const [currentAnimationGroup, setCurrentAnimationGroup] = useState<BABYLON.AnimationGroup>();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    console.log('animationIngredients: ', animationIngredients);
  }, [animationIngredients]);

  // 애니메이션 생성
  useEffect(() => {
    const visualizedAnimationIngredients = animationIngredients.filter(
      (animationIngredient) =>
        visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
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
            const newAnimation = new BABYLON.Animation(
              track.name,
              `${track.property}.${track.axis}`,
              fps / 30,
              BABYLON.Animation.ANIMATIONTYPE_FLOAT,
              BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
            );
            if (track.useFilter) {
              // filter function 적용
            } else {
              newAnimation.setKeys(track.transformKeys);
            }
            track.target.animations.push(newAnimation);
            newAnimationGroup.addTargetedAnimation(newAnimation, track.target);
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
        currentAnimationGroup.onAnimationEndObservable.addOnce((...params) => {});

        scene.addAnimationGroup(currentAnimationGroup);

        if (isPlaying) {
          currentAnimationGroup.start(true);
        } else {
          currentAnimationGroup.start(true);
          currentAnimationGroup.pause();
          currentAnimationGroup.goToFrame(0);
        }
      }
    });
  }, [currentAnimationGroup, isPlaying, sceneList]);
};

export default useAnimation;
