import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useSelector } from 'reducers';

const useAnimation = () => {
  const { sceneList, assetList, visualizedAssetIds, fps } = useSelector(
    (state) => state.shootProject,
  );

  const [currentAnimationGroup, setCurrentAnimationGroup] = useState<BABYLON.AnimationGroup>();
  const [isPlaying, setIsPlaying] = useState(true);

  // 애니메이션 생성
  useEffect(() => {
    const visualizedAssets = assetList.filter((asset) => visualizedAssetIds.includes(asset.id));

    visualizedAssets.forEach((asset) => {
      const currentAnimationIngredient = asset.animationIngredients.find(
        (ingredient) => ingredient.id === asset.currentAnimationIngredientId,
      );
      if (currentAnimationIngredient) {
        const newAnimationGroup = new BABYLON.AnimationGroup(currentAnimationIngredient.name);

        currentAnimationIngredient.tracks.forEach((track) => {
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

        setCurrentAnimationGroup(newAnimationGroup);
      }
    });
  }, [assetList, fps, visualizedAssetIds]);

  // 애니메이션 재생 조작
  useEffect(() => {
    sceneList.forEach((shootScene) => {
      const { id: sceneId, name, scene, canvasId } = shootScene;

      if (currentAnimationGroup) {
        currentAnimationGroup.onAnimationEndObservable.addOnce((...params) => {
          console.log('params: ', params);
        });

        scene.addAnimationGroup(currentAnimationGroup);

        if (isPlaying) {
          currentAnimationGroup.play();
        }
      }
    });
  }, [currentAnimationGroup, isPlaying, sceneList]);
};

export default useAnimation;
