import * as BABYLON from '@babylonjs/core';

export type SelectingDataAction =
  | ReturnType<typeof addSelectableObjects>
  | ReturnType<typeof removeSelectableControllers>
  | ReturnType<typeof removeSelectableJoints>
  | ReturnType<typeof unrenderAsset>
  | ReturnType<typeof defaultSingleSelect>
  | ReturnType<typeof defaultMultiSelect>
  | ReturnType<typeof ctrlKeySingleSelect>
  | ReturnType<typeof ctrlKeyMultiSelect>
  | ReturnType<typeof resetSelectedTargets>;

const ADD_SELECTABLE_OBJECTS = 'selectingDataAction/ADD_SELECTABLE_OBJECTS' as const;
const REMOVE_SELECTABLE_CONTROLLERS = 'selectingDataAction/REMOVE_SELECTABLE_CONTROLLERS' as const;
const REMOVE_SELECTABLE_JOINTS = 'selectingDataAction/REMOVE_SELECTABLE_JOINTS' as const;
const UNRENDER_ASSET = 'selectingDataAction/UNRENDER_ASSET' as const;

const DEFAULT_SINGLE_SELECT = 'selectingDataAction/DEFAULT_SINGLE_SELECT' as const;
const DEFAULT_MULTI_SELECT = 'selectingDataAction/DEFAULT_MULTI_SELECT' as const;

const CTRL_KEY_SINGLE_SELECT = 'selectingDataAction/CTRL_KEY_SINGLE_SELECT' as const;
const CTRL_KEY_MULTI_SELECT = 'selectingDataAction/CTRL_KEY_MULTI_SELECT' as const;

const RESET_SELECTED_TARGETS = 'selectingDataAction/RESET_SELECTED_TARGETS' as const;

interface AddSelectableObjects {
  objects: Array<BABYLON.Mesh | BABYLON.TransformNode>;
}

interface RemoveSelectableControllers {
  assetId: string;
}

interface RemoveSelectableJoints {
  assetId: string;
}

interface UnrenderAsset {
  assetId: string;
}

interface DefaultSingleSelect {
  target: BABYLON.Mesh | BABYLON.TransformNode;
}

interface DefaultMultiSelect {
  targets: Array<BABYLON.Mesh | BABYLON.TransformNode>;
}

interface CtrlKeySingleSelect {
  target: BABYLON.Mesh | BABYLON.TransformNode;
}

interface CtrlKeyMultiSelect {
  targets: Array<BABYLON.Mesh | BABYLON.TransformNode>;
}

/**
 * 드래그박스를 통해 선택여부를 판단할 대상들에 controller 혹은 joint들을 포함시킵니다.
 * joint의 경우 해당 모델의 visualize 시점에, controller의 경우 컨트롤러 생성 시점에 추가합니다.
 *
 * @param objects - 판단 대상들에 포함시킬 controller 혹은 joint들
 */
export const addSelectableObjects = (params: AddSelectableObjects) => ({
  type: ADD_SELECTABLE_OBJECTS,
  payload: {
    ...params,
  },
});

/**
 * 드래그박스를 통해 선택여부를 판단할 대상들에서 특정 asset의 controller들을 제외합니다.
 * 이떄, 이미 선택되어 있다면 선택을 해제합니다.
 * asset unrender 혹은 controller 삭제 시에 제외합니다.
 *
 * @param assetId - 판단 대상에서 제외할 controller들의 asset의 id
 */
export const removeSelectableControllers = (params: RemoveSelectableControllers) => ({
  type: REMOVE_SELECTABLE_CONTROLLERS,
  payload: {
    ...params,
  },
});

/**
 * 드래그박스를 통해 선택여부를 판단할 대상들에서 특정 asset의 joint들을 제외합니다.
 * 이떄, 이미 선택되어 있다면 선택을 해제합니다.
 * asset unrender시에 제외합니다.
 *
 * @param assetId - 판단 대상에서 제외할 joint들의 asset의 id
 */
export const removeSelectableJoints = (params: RemoveSelectableJoints) => ({
  type: REMOVE_SELECTABLE_JOINTS,
  payload: {
    ...params,
  },
});

/**
 * 특정 asset을 unrender시에 호출하며, 해당 asset의 controller와 transformNode를 모두 선택 대상에서 제외합니다.
 *
 * @param assetId - unrender 대상 asset
 */
export const unrenderAsset = (params: UnrenderAsset) => ({
  type: UNRENDER_ASSET,
  payload: {
    ...params,
  },
});

/**
 * 단일 대상을 기본 클릭하는 경우.
 * saga를 통해 해당 대상이 현재 selectedTargets와 동일한지를 체크합니다.
 * 동일한 경우 state를 변경하지 않고, 동일하지 않은 경우 기존 선택을 해제하고 단일 선택모드로 본 대상을 선택합니다.
 *
 * @param target - 선택 대상
 */
export const defaultSingleSelect = (params: DefaultSingleSelect) => ({
  type: DEFAULT_SINGLE_SELECT,
  payload: {
    ...params,
  },
});

/**
 * 다수의 대상을 기본 클릭(드래그)하는 경우. 기존 선택을 해제하고 다중 선택모드로 본 대상들을 선택합니다.
 *
 * @param targets - 선택 대상들
 */
export const defaultMultiSelect = (params: DefaultMultiSelect) => ({
  type: DEFAULT_MULTI_SELECT,
  payload: {
    ...params,
  },
});

/**
 * 단일 대상을 Ctri(혹은 Meta)키와 함께 클릭하는 경우.
 * saga를 통해 해당 대상이 현재 selectedTargets에 포함되어 있는지를 체크합니다.
 * 이미 포함되어 있는 경우 본 대상을 선택 해제하고, 포함되어 있지 않는 경우 다중 선택모드로 본 대상을 추가 선택합니다.
 *
 * @param target - 선택 대상
 */
export const ctrlKeySingleSelect = (params: CtrlKeySingleSelect) => ({
  type: CTRL_KEY_SINGLE_SELECT,
  payload: {
    ...params,
  },
});

/**
 * 다중 대상을 Ctrl(혹은 Meta)키와 함께 클릭하는 경우.
 * 본 대상들 중 이미 선택된 대상은 선택 해제하고, 포함되어 있지 않은 대상들은 다중 선택모드로 선택에 추가합니다.
 *
 * @param targets - 선택 대상들
 */
export const ctrlKeyMultiSelect = (params: CtrlKeyMultiSelect) => ({
  type: CTRL_KEY_MULTI_SELECT,
  payload: {
    ...params,
  },
});

/**
 * 모든 선택을 해제합니다.
 */
export const resetSelectedTargets = () => ({
  type: RESET_SELECTED_TARGETS,
});
