import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, PlaskRetargetMap } from 'types/common';

export type AnimationDataAction =
  | ReturnType<typeof addAsset>
  | ReturnType<typeof removeAsset>
  | ReturnType<typeof addAnimationIngredient>
  | ReturnType<typeof addAnimationIngredients>
  | ReturnType<typeof editAnimationIngredient>
  | ReturnType<typeof editAnimationIngredients>
  | ReturnType<typeof changeCurrentAnimationIngredient>
  | ReturnType<typeof removeAnimationIngredient>
  | ReturnType<typeof toggleLayerMuteness>
  | ReturnType<typeof editRetargetMap>;

// transformNodes 관련
const ADD_ASSET = 'animationDataAction/ADD_ASSET' as const;
const REMOVE_ASSET = 'animationDataAction/REMOVE_ASSET' as const;
// animationIngredient 관련
const ADD_ANIMATION_INGREDIENT = 'animationDataAction/ADD_ANIMATION_INGREDIENT' as const;
const ADD_ANIMATION_INGREDIENTS = 'animationDataAction/ADD_ANIMATION_INGREDIENTS' as const;
const EDIT_ANIMATION_INGREDIENT = 'animationDataAction/EDIT_ANIMATION_INGREDIENT' as const;
const EDIT_ANIMATION_INGREDIENTS = 'animationDataAction/EDIT_ANIMATION_INGREDIENTS' as const;
const REMOVE_ANIMATION_INGREDIENT = 'animationDataAction/REMOVE_ANIMATION_INGREDIENT' as const;
const TOGGLE_LAYER_MUTENESS = 'animationDataAction/TOGGLE_LAYER_MUTENESS' as const;
const CHANGE_CURRENT_ANIMATION_INGREDIENT = 'animationDataAction/CHANGE_CURRENT_ANIMATION_INGREDIENT' as const;
export const EDIT_KEYFRAMES = 'animationDataAction/EDIT_KEYFRAMES' as const; // saga내 사용을 위해 export

// retargetMap 관련
const EDIT_RETARGET_MAP = 'animationDataAction/EDIT_RETARGET_MAP' as const;

interface AddAsset {
  transformNodes: BABYLON.TransformNode[];
  animationIngredients: AnimationIngredient[];
  retargetMap: PlaskRetargetMap;
}

/**
 * asset을 추가함에 따르는 애니메이션 데이터를 추가합니다. asset을 로드하는 경우에 호출합니다.
 *
 * @param transformNodes - 로드할 asset이 가진 transformNodes
 * @param animationIngredients - 로드한 asset의 animationIngredients
 * @param retargetMap - 로드한 asset의 retargetMap
 */
export const addAsset = (params: AddAsset) => ({
  type: ADD_ASSET,
  payload: {
    ...params,
  },
});

interface RemoveAsset {
  assetId: string;
}

/**
 * asset을 제거함에 따르는 애니메이션 데이터를 삭제합니다. asset을 LP에서 제거하는 경우에 호출합니다.
 *
 * @param assetId - 제거할 asset의 id
 */
export const removeAsset = (params: RemoveAsset) => ({
  type: REMOVE_ASSET,
  payload: {
    ...params,
  },
});

interface AddAnimationIngredient {
  animationIngredient: AnimationIngredient;
}

/**
 * 하나의 animationIngredient를 추가합니다. 1) 빈 모션 생성 2) Mocap 시에 호출합니다.
 *
 * @param animationIngredient - 추가할 animationIngredient
 */
export const addAnimationIngredient = (params: AddAnimationIngredient) => ({
  type: ADD_ANIMATION_INGREDIENT,
  payload: {
    ...params,
  },
});

interface AddAnimationIngredients {
  animationIngredients: AnimationIngredient[];
}

/**
 * 여러개의 animationIngredeint를 추가합니다. model 복제 시 사용합니다.
 *
 * @param animationIngredients - 추가할 animationIngredients
 */
export const addAnimationIngredients = (params: AddAnimationIngredients) => ({
  type: ADD_ANIMATION_INGREDIENTS,
  payload: {
    ...params,
  },
});

interface EditAnimationIngredient {
  animationIngredient: AnimationIngredient;
}

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

interface EditAnimationIngredients {
  animationIngredients: AnimationIngredient[];
}

/**
 * 전체 animationIngredients 데이터를 수정합니다.
 *
 * @param animationIngredients - animationIngredients
 */
export const editAnimationIngredients = (params: EditAnimationIngredients) => ({
  type: EDIT_ANIMATION_INGREDIENTS,
  payload: {
    ...params,
  },
});

interface ChangeCurrentAnimationIngredient {
  assetId: string;
  animationIngredientId: string;
}

/**
 * asset의 현재 애니메이션을 결정하는 animationIngredient를 변경합니다.
 *
 * @param assetId - 대상 animationIngredient가 속한 asset의 id
 * @param animationIngredientId - 대상 animationIngredient
 */
export const changeCurrentAnimationIngredient = (params: ChangeCurrentAnimationIngredient) => ({
  type: CHANGE_CURRENT_ANIMATION_INGREDIENT,
  payload: {
    ...params,
  },
});

interface RemoveAnimationIngredient {
  animationIngredientId: string;
}

/**
 * 특정 animationIngredient를 삭제합니다.
 *
 * @param animationIngredientId - 삭제할 animationIngredient의 id
 */
export const removeAnimationIngredient = (params: RemoveAnimationIngredient) => ({
  type: REMOVE_ANIMATION_INGREDIENT,
  payload: {
    ...params,
  },
});

interface ToggleLayerMuteness {
  animationIngredientId: string;
  layerId: string;
}

/**
 * 특정 layer를 렌더링되는 애니메이션에서 제외합니다.
 *
 * @param animationIngredientId - 해당 layer가 속한 animationIngredient의 id
 * @param layerId - 대상 layer의 id
 */
export const toggleLayerMuteness = (params: ToggleLayerMuteness) => ({
  type: TOGGLE_LAYER_MUTENESS,
  payload: {
    ...params,
  },
});

interface EditKeyframes {}

/**
 * edit keyframe saga를 동작시킵니다.
 *
 * @param params
 */
export const editKeyframes = (params: EditKeyframes) => ({
  type: EDIT_KEYFRAMES,
  payload: {
    ...params,
  },
});

interface EditRetargetMap {
  retargetMap: PlaskRetargetMap;
}

/**
 * retargetMap을 수정합니다. 자동/수동 리타게팅 시 호출합니다.
 *
 * @param retargetMap - 수정할 대상이 되는 retargetMap
 */
export const editRetargetMap = (params: EditRetargetMap) => ({
  type: EDIT_RETARGET_MAP,
  payload: {
    ...params,
  },
});
