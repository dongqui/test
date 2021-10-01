import { ShootAsset, ShootScene } from 'types/common';

export type ShootProjectAction =
  | ReturnType<typeof addScene>
  | ReturnType<typeof changeFileToLoad>
  | ReturnType<typeof addAsset>
  | ReturnType<typeof renderAsset>
  | ReturnType<typeof unrenderAsset>
  | ReturnType<typeof removeAsset>;

export const ADD_SCENE = 'shootProject/ADD_SCENE' as const;
export const CHANGE_FILE_TO_LOAD = 'shootProject/CHANGE_FILE_TO_LOAD' as const;
export const ADD_ASSET = 'shootProject/ADD_ASSET' as const;
export const RENDER_ASSET = 'shootProject/RENDER_ASSET' as const;
export const UNRENDER_ASSET = 'shootProject/UNRENDER_ASSET' as const;
export const REMOVE_ASSET = 'shootProject/REMOVE_ASSET' as const;

interface AddScene {
  scene: ShootScene;
}

interface ChangeFileToLoad {
  file: string | File;
}

interface AddAsset {
  asset: ShootAsset;
}

interface RenderAsset {
  assetId: string;
}

interface UnrenderAsset {
  assetId: string;
}

interface RemoveAsset {
  assetId: string;
}

/**
 * scene을 추가합니다.
 *
 * @param scene - 각 canvas에서  해당하는 scene
 */
export const addScene = (params: AddScene) => ({
  type: ADD_SCENE,
  payload: {
    ...params,
  },
});

/**
 * 읽어들일 파일을 변경합니다.
 *
 * @param file - 읽어들일 파일의 주소 혹은 파일 그 자체
 */
export const changeFileToLoad = (params: ChangeFileToLoad) => ({
  type: CHANGE_FILE_TO_LOAD,
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
 * 전달받은 id에 해당하는 asset을 sceneList에 있는 모든 scene들에 추가합니다.
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
 * 전달받은 id에 해당하는 asset을 sceneList에 있는 모든 scene들에서 제거합니다.
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
