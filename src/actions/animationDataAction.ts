import { TransformNode } from '@babylonjs/core';
import { AnimationIngredient, PlaskRetargetMap, RetargetSourceBoneType } from 'types/common';

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
  | ReturnType<typeof turnFilterOn>
  | ReturnType<typeof turnFilterOff>
  | ReturnType<typeof changeTrackFilterBeta>
  | ReturnType<typeof changeTrackFilterMinCutoff>
  | ReturnType<typeof assignBoneMapping>
  | ReturnType<typeof changeHipSpace>;

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
const TURN_FILTER_ON = 'animationDataAction/TURN_FILTER_ON' as const;
const TURN_FILTER_OFF = 'animationDataAction/TURN_FILTER_OFF' as const;
const CHANGE_TRACK_FILTER_BETA = 'animationDataAction/CHANGE_TRACK_FILTER_BETA' as const;
const CHANGE_TRACK_FILTER_MIN_CUTOFF = 'animationDataAction/CHANGE_TRACK_FILTER_MIN_CUTOFF' as const;

// retargetMap 관련
const ASSIGN_BONE_MAPPING = 'animationDataAction/ASSIGN_BONE_MAPPING' as const;
const CHANGE_HIP_SPACE = 'animationDataAction/CHANGE_HIP_SPACE' as const;

interface AddAsset {
  transformNodes: TransformNode[];
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

/**
 * edit keyframe saga를 동작시킵니다.
 *
 */
export const editKeyframes = () => ({
  type: EDIT_KEYFRAMES,
});

interface TurnFilterOn {
  animationIngredientId: string;
  layerId: string;
}

/**
 * animationIngredient에 filter를 적용합니다.
 *
 * @param animationIngredeint - 대상 animationIngredient의 id
 */
export const turnFilterOn = (params: TurnFilterOn) => ({
  type: TURN_FILTER_ON,
  payload: {
    ...params,
  },
});

interface TurnFilterOff {
  animationIngredientId: string;
  layerId: string;
}

/**
 * animationIngredient의 filter 적용을 해제합니다.
 *
 * @param animationIngredeint - 대상 animationIngredient의 id
 */
export const turnFilterOff = (params: TurnFilterOff) => ({
  type: TURN_FILTER_OFF,
  payload: {
    ...params,
  },
});

interface ChangeTrackFilterBeta {
  layerId: string;
  trackId: string;
  value: number;
}

export const changeTrackFilterBeta = (params: ChangeTrackFilterBeta) => ({
  type: CHANGE_TRACK_FILTER_BETA,
  payload: {
    ...params,
  },
});

interface ChangeTrackFilterMinCutoff {
  layerId: string;
  trackId: string;
  value: number;
}

export const changeTrackFilterMinCutoff = (params: ChangeTrackFilterMinCutoff) => ({
  type: CHANGE_TRACK_FILTER_MIN_CUTOFF,
  payload: {
    ...params,
  },
});

interface AssignBoneMapping {
  assetId: string;

  sourceBoneName: RetargetSourceBoneType;

  targetTransformNodeId: string;
}

/**
 * 수동 리타겟팅에서 source와 target을 mapping합니다.
 */
export const assignBoneMapping = (params: AssignBoneMapping) => ({
  type: ASSIGN_BONE_MAPPING,
  payload: {
    ...params,
  },
});

interface ChangeHipSpace {
  assetId: string;

  hipSpace: number;
}

/**
 * 수동 리타겟팅에서 hip space value를 변경합니다.
 */
export const changeHipSpace = (params: ChangeHipSpace) => ({
  type: CHANGE_HIP_SPACE,
  payload: {
    ...params,
  },
});
