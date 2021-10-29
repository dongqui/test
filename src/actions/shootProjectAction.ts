import { ShootAsset, ShootScene } from 'types/common';

export type ShootProjectAction =
  | ReturnType<typeof addScene>
  | ReturnType<typeof removeScene>
  | ReturnType<typeof changeFileToLoad>
  | ReturnType<typeof addAsset>
  | ReturnType<typeof renderAsset>
  | ReturnType<typeof unrenderAsset>
  | ReturnType<typeof removeAsset>
  | ReturnType<typeof addMotion>;

const ADD_SCENE = 'shootProject/ADD_SCENE' as const;
const REMOVE_SCENE = 'shootProject/REMOVE_SCENE' as const;
const CHANGE_FILE_TO_LOAD = 'shootProject/CHANGE_FILE_TO_LOAD' as const;
const ADD_ASSET = 'shootProject/ADD_ASSET' as const;
const RENDER_ASSET = 'shootProject/RENDER_ASSET' as const;
const UNRENDER_ASSET = 'shootProject/UNRENDER_ASSET' as const;
const REMOVE_ASSET = 'shootProject/REMOVE_ASSET' as const;
const ADD_MOTION = 'shootProject/ADD_MOTION' as const;

interface AddScene {
  scene: ShootScene;
}

interface RemoveScene {
  sceneId: string;
}

interface ChangeFileToLoad {
  file: string | File;
  fileName: string;
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

interface AddMotion {
  assetId: string;
  motionId: string;
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
 * scene을 list에서 제거합니다.
 *
 * @param sceneId - 제거할 scene의 id
 */
export const removeScene = (params: RemoveScene) => ({
  type: REMOVE_SCENE,
  payload: {
    ...params,
  },
});

/**
 * 읽어들일 파일을 변경합니다.
 *
 * @param file - 읽어들일 파일의 주소 혹은 파일 그 자체
 * @param fileName - LP에서 사용할 파일의 이름
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
