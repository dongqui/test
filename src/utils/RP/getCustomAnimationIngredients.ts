import * as BABYLON from '@babylonjs/core';

import { filterAnimatableTransformNodes } from 'utils/common';
import { AnimationIngredient } from 'types/common';
import plaskEngine from '3d/PlaskEngine';

export default function getCustomAnimationIngredients(assetId: string, transformNodes: BABYLON.TransformNode[], animationGroups: BABYLON.AnimationGroup[]) {
  const animationIngredients: AnimationIngredient[] = [];

  animationGroups.forEach((animationGroup, idx) => {
    // block auto play when loading assets
    // @TODO need to find better ways to block
    animationGroup.pause();

    /**
     * create our custom data(animationIngredient) with asset's animationGroups
     * and set the first one as current animationIngredient
     */
    const animationIngredient = plaskEngine.animationModule.createAnimationIngredient(
      assetId,
      animationGroup.name,
      animationGroup.targetedAnimations,
      filterAnimatableTransformNodes(transformNodes),
      false,
      idx === 0,
    );

    animationIngredients.push(animationIngredient);
  });

  return animationIngredients;
}
