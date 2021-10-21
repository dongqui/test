import { AnimationIngredient } from 'types/common';

export type AnimationIngredientsAction =
  | ReturnType<typeof addAnimationIngredients>
  | ReturnType<typeof editAnimationIngredient>
  | ReturnType<typeof addMotion>;

const ADD_ANIMATION_INGREDIENTS = 'animationIngredientsAction/ADD_ANIMATION_INGREDIENTS' as const;
const EDIT_ANIMATION_INGREDIENT = 'animationIngredientsAction/EDIT_ANIMATION_INGREDIENT' as const;

const ADD_MOTION = 'animationIngredientsAction/ADD_MOTION' as const;

interface AddAnimationIngredients {
  animationIngredients: AnimationIngredient[];
}

interface EditAnimationIngredient {
  animationIngredient: AnimationIngredient;
}

/**
 * animation 재료로 사용되는 자체 데이터들을 추가합니다. 파일 로드 시에 호출하며, 파일에 들어있는 animationGroup을 사용해서 구성한 자체 데이터들을 parameter로 넘겨줍니다.
 *
 * @param animationIngredients - animation 재료로 사용되는 데이터들
 */
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

/**
 * 특정 animationIngredient의 데이터를 수정합니다.
 *
 * @param animationIngredient - 수정 대상이 되는 animationIngredient
 */
export const editAnimationIngredient = (params: EditAnimationIngredient) => ({
  type: EDIT_ANIMATION_INGREDIENT,
  payload: {
    ...params,
  },
});

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
