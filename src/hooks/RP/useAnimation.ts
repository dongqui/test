import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useSelector } from 'reducers';

const useAnimation = () => {
  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const assetList = useSelector((state) => state.shootProject.assetList);
  const visualizedAssetIds = useSelector((state) => state.shootProject.visualizedAssetIds);
  const fps = useSelector((state) => state.shootProject.fps);

  const animationIngredients = useSelector((state) => state.animationIngredients);

  const [currentAnimationGroup, setCurrentAnimationGroup] = useState<BABYLON.AnimationGroup>();
  const [isPlaying, setIsPlaying] = useState(true);

  // 애니메이션 생성
  useEffect(() => {
    const visualizedAnimationIngredients = animationIngredients.filter(
      (animationIngredient) =>
        visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
    );

    const newAnimationGroup = new BABYLON.AnimationGroup('totalAnimationGroup');

    visualizedAnimationIngredients.forEach((animationIngredient) => {
      animationIngredient.tracks.forEach((track) => {
        if (track.isIncluded) {
          const newAnimation = new BABYLON.Animation(
            track.name,
            `${track.property}.${track.axis}`,
            fps / 30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
          );
          if (track.useFilter) {
            // filter function 적용
          } else {
            newAnimation.setKeys(track.transformKeys);
          }
          track.target.animations.push(newAnimation);
          newAnimationGroup.addTargetedAnimation(newAnimation, track.target);
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
          currentAnimationGroup.play();
        }
      }
    });
  }, [currentAnimationGroup, isPlaying, sceneList]);
};

export default useAnimation;
