import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, PlaskRetargetMap, RetargetSourceBoneType } from 'types/common';

export type AnimationDataAction =
  | ReturnType<typeof addAsset>
  | ReturnType<typeof removeAsset>
  | ReturnType<typeof addAnimationIngredient>
  | ReturnType<typeof editAnimationIngredient>
  | ReturnType<typeof editAnimationIngredients>
  | ReturnType<typeof changeCurrentAnimationIngredient>
  | ReturnType<typeof removeAnimationIngredient>
  | ReturnType<typeof assignBoneMapping>
  | ReturnType<typeof changeHipSpace>;

// transformNodes 관련
const ADD_ASSET = 'animationDataAction/ADD_ASSET' as const;
const REMOVE_ASSET = 'animationDataAction/REMOVE_ASSET' as const;
// animationIngredient 관련
const ADD_ANIMATION_INGREDIENT = 'animationDataAction/ADD_ANIMATION_INGREDIENT' as const;
const EDIT_ANIMATION_INGREDIENT = 'animationDataAction/EDIT_ANIMATION_INGREDIENT' as const;
const EDIT_ANIMATION_INGREDIENTS = 'animationDataAction/EDIT_ANIMATION_INGREDIENTS' as const;
const REMOVE_ANIMATION_INGREDIENT = 'animationDataAction/REMOVE_ANIMATION_INGREDIENT' as const;
const CHANGE_CURRENT_ANIMATION_INGREDIENT = 'animationDataAction/CHANGE_CURRENT_ANIMATION_INGREDIENT' as const;
// retargetMap 관련
const ASSIGN_BONE_MAPPING = 'animationDataAction/ASSIGN_BONE_MAPPING' as const;
const CHANGE_HIP_SPACE = 'animationDataAction/CHANGE_HIP_SPACE' as const;

interface AddAsset {
  transformNodes: BABYLON.TransformNode[];
  animationIngredients: AnimationIngredient[];
  retargetMap: PlaskRetargetMap;
}

interface RemoveAsset {
  assetId: string;
}

interface AddAnimationIngredient {
  animationIngredient: AnimationIngredient;
}

interface EditAnimationIngredient {
  animationIngredient: AnimationIngredient;
}

interface EditAnimationIngredients {
  animationIngredients: AnimationIngredient[];
}

interface ChangeCurrentAnimationIngredient {
  assetId: string;
  animationIngredientId: string;
}

interface RemoveAnimationIngredient {
  animationIngredientId: string;
}

interface AssignBoneMapping {
  assetId: string;
  sourceBoneName: RetargetSourceBoneType;
  targetTransformNodeId: string;
}

interface ChangeHipSpace {
  assetId: string;
  hipSpaece: number;
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

/**
 * 하나의 animationIngredeint를 추가합니다. 1) 빈 모션 생성 2) Mocap 시에 호출합니다.
 *
 * @param assetId - 빈 모션을 추가할 대상이되는 asset의 id
 */
export const addAnimationIngredient = (params: AddAnimationIngredient) => ({
  type: ADD_ANIMATION_INGREDIENT,
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

export const changeCurrentAnimationIngredient = (params: ChangeCurrentAnimationIngredient) => ({
  type: CHANGE_CURRENT_ANIMATION_INGREDIENT,
  payload: {
    ...params,
  },
});

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

/**
 * 수동 리타겟팅에서 source와 target을 mapping합니다.
 */
export const assignBoneMapping = (params: AssignBoneMapping) => ({
  type: ASSIGN_BONE_MAPPING,
  payload: {
    ...params,
  },
});

/**
 * 수동 리타겟팅에서 hip space value를 변경합니다.
 */
export const changeHipSpace = (params: ChangeHipSpace) => ({
  type: CHANGE_HIP_SPACE,
  payload: {
    ...params,
  },
});
