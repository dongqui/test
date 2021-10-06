import * as BABYLON from '@babylonjs/core';

export type SelectedTargetsAction =
  | ReturnType<typeof defaultSingleSelect>
  | ReturnType<typeof defaultMultiSelect>
  | ReturnType<typeof ctrlKeySingleSelect>
  | ReturnType<typeof ctrlKeyMultiSelect>
  | ReturnType<typeof resetSelectedTargets>;

export const DEFAULT_SINGLE_SELECT = 'selectedTargetsAction/DEFAULT_SINGLE_SELECT' as const;
export const DEFAULT_MULTI_SELECT = 'selectedTargetsAction/DEFAULT_MULTI_SELECT' as const;

export const CTRL_KEY_SINGLE_SELECT = 'selectedTargetsAction/CTRL_KEY_SINGLE_SELECT' as const;
export const CTRL_KEY_MULTI_SELECT = 'selectedTargetsAction/CTRL_KEY_MULTI_SELECT' as const;

export const RESET_SELECTED_TARGETS = 'selectedTargetsAction/RESET_SELECTED_TARGETS' as const;

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
