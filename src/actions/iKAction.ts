import { AnimationIngredient } from 'types/common';
import { createAction } from 'typesafe-actions';

export const ADD_IK = 'ikActions/ADD_IK' as const;
export const addIKAction = createAction(ADD_IK, (assetId: string, animationIngredient?: AnimationIngredient) => ({
  assetId,
  animationIngredient,
}))();

export const REMOVE_IK = 'ikActions/REMOVE_IK' as const;
export const removeIKAction = createAction(REMOVE_IK, (assetId: string) => ({
  assetId,
}))();
