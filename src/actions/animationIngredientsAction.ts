import { AnimationIngredient } from 'types/common';

export type AnimationIngredientsAction = ReturnType<typeof addAnimationIngredients>;

const ADD_ANIMATION_INGREDIENTS = 'animationIngredientsAction/ADD_ANIMATION_INGREDIENTS' as const;

interface AddAnimationIngredients {
  animationIngredients: AnimationIngredient[];
}

export const addAnimationIngredients = (params: AddAnimationIngredients) => ({
  type: ADD_ANIMATION_INGREDIENTS,
  payload: {
    ...params,
  },
});
