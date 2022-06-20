import { AnimationIngredient } from 'types/common';
import { createAction } from 'typesafe-actions';

export const ADD_IK = 'ikActions/ADD_IK' as const;
export const addIKAction = createAction(ADD_IK, (assetId: string, animationIngredient?: AnimationIngredient) => ({
  assetId,
  animationIngredient,
}))();
