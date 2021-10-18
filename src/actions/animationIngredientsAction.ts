import { AnimationIngredient } from 'types/common';

export type AnimationIngredientsAction =
  | ReturnType<typeof addAnimationIngredients>
  | ReturnType<typeof addMotion>;

const ADD_ANIMATION_INGREDIENTS = 'animationIngredientsAction/ADD_ANIMATION_INGREDIENTS' as const;
const ADD_MOTION = 'animationIngredientsAction/ADD_MOTION' as const;

interface AddAnimationIngredients {
  animationIngredients: AnimationIngredient[];
}

interface EditAnimationIngredient {
  id: string;
}

interface AddMotion {
  assetId: string;
  animationIngredient: AnimationIngredient;
}

export const addAnimationIngredients = (params: AddAnimationIngredients) => ({
  type: ADD_ANIMATION_INGREDIENTS,
  payload: {
    ...params,
  },
});

export const editAnimationIngredients = (params: EditAnimationIngredient) => ({});

/**
 * 전달받은 id에 해당하는 asset에 빈 모션을 추가
 *
 * @param assetId - 빈 모션을 추가할 대상이되는 asset의 id
 */
export const addMotion = (params: AddMotion) => ({
  type: ADD_MOTION,
  payload: {
    ...params,
  },
});
