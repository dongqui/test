import { PlaskAsset, PlaskScreen } from 'types/common';

export type PlaskProjectAction =
  | ReturnType<typeof addScreen>
  | ReturnType<typeof removeScreen>
  | ReturnType<typeof addAsset>
  | ReturnType<typeof renderAsset>
  | ReturnType<typeof unrenderAsset>
  | ReturnType<typeof removeAsset>
  | ReturnType<typeof addMotion>;

export const ADD_SCREEN = 'plaskProject/ADD_SCREEN' as const;
export const REMOVE_SCREEN = 'plaskProject/REMOVE_SCREEN' as const;
export const ADD_ASSET = 'plaskProject/ADD_ASSET' as const;
export const RENDER_ASSET = 'plaskProject/RENDER_ASSET' as const;
export const UNRENDER_ASSET = 'plaskProject/UNRENDER_ASSET' as const;
export const REMOVE_ASSET = 'plaskProject/REMOVE_ASSET' as const;
export const ADD_MOTION = 'plaskProject/ADD_MOTION' as const;

export interface AddScreen {
  screen: PlaskScreen;
}

export interface RemoveScreen {
  screenId: string;
}

export interface AddAsset {
  asset: PlaskAsset;
}

export interface RenderAsset {
  assetId: string;
}

export interface UnrenderAsset {
  // 단일 모델일 때는 unrender가 아니라 reset의 기능이기 때문에, 삭제할 asset의 id가 필요없음
  // assetId: string;
}

export interface RemoveAsset {
  assetId: string;
}

export interface AddMotion {
  assetId: string;
  motionId: string;
}

/**
 * screen을 추가합니다.
 *
 * @param screen - 각 canvas에서  해당하는 screen
 */
export const addScreen = (params: AddScreen) => ({
  type: ADD_SCREEN,
  payload: {
    ...params,
  },
});

/**
 * screen을 list에서 제거합니다.
 *
 * @param screenId - 제거할 screen의 id
 */
export const removeScreen = (params: RemoveScreen) => ({
  type: REMOVE_SCREEN,
  payload: {
    ...params,
  },
});

/**
 * 로드한 파일에서 전처리를 거친 asset을 추가합니다.
 *
 * @param asset - 전처리를 거친 asset
 */
export const addAsset = (params: AddAsset) => ({
  type: ADD_ASSET,
  payload: {
    ...params,
  },
});

/**
 * 전달받은 id에 해당하는 asset을 screenList에 있는 모든 scene들에 추가합니다.
 *
 * @param assetId - scene들에 추가할 asset의 id
 */
export const renderAsset = (params: RenderAsset) => ({
  type: RENDER_ASSET,
  payload: {
    ...params,
  },
});

/**
 * 전달받은 id에 해당하는 asset을 screenList에 있는 모든 scene들에서 제거합니다.
 *
 * @param assetId - scene들에서 제거할 asset의 id
 */
export const unrenderAsset = (params: UnrenderAsset) => ({
  type: UNRENDER_ASSET,
  payload: {
    ...params,
  },
});

/**
 * 전달받은 id에 해당하는 asset을 프로젝트에서 삭제합니다.
 *
 * @param assetId - 프로젝트에서 삭제할 asset의 id
 */
export const removeAsset = (params: RemoveAsset) => ({
  type: REMOVE_ASSET,
  payload: {
    ...params,
  },
});

/**
 * 전달받은 id에 해당하는 asset에 추가한 빈 모션의 id를 하위로 할당한다.
 *
 * @param assetId - 추가한 모션의 id를 할당할 asset의 id
 * @param motionId - 새로 생성한 빈 모션의 id
 */
export const addMotion = (params: AddMotion) => ({
  type: ADD_MOTION,
  payload: {
    ...params,
  },
});
