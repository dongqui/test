import { ShootScene } from 'types/common';

export type ShootProjectAction = ReturnType<typeof addScene> | ReturnType<typeof changeFileToLoad>;

export const ADD_SCENE = 'shootProject/ADD_SCENE' as const;
export const CHANGE_FILE_TO_LOAD = 'shootProject/CHANGE_FILE_TO_LOAD' as const;

interface AddScene {
  scene: ShootScene;
}

interface ChangeFileToLoad {
  file: string | File;
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
