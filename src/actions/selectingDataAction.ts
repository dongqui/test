import { PlaskEntity } from '3d/entities/PlaskEntity';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';

import { SelectingData } from 'types/common';
export type SelectingDataAction =
  | ReturnType<typeof updateSelectableObjects>
  | ReturnType<typeof addSelectableObjects>
  | ReturnType<typeof removeSelectableObjects>
  | ReturnType<typeof removeSelectableControllers>
  | ReturnType<typeof removeSelectableJoints>
  | ReturnType<typeof unrenderAsset>
  | ReturnType<typeof defaultSingleSelect>
  | ReturnType<typeof defaultMultiSelect>
  | ReturnType<typeof ctrlKeySingleSelect>
  | ReturnType<typeof ctrlKeyMultiSelect>
  | ReturnType<typeof selectAllSelectableObjects>
  | ReturnType<typeof resetSelectedTargets>
  | ReturnType<typeof addEntity>
  | ReturnType<typeof removeEntity>
  | ReturnType<typeof override>;

const UPDATE_SELECTABLE_OBJECTS = 'selectingDataAction/UPDATE_SELECTABLE_OBJECTS' as const;
const ADD_SELECTABLE_OBJECTS = 'selectingDataAction/ADD_SELECTABLE_OBJECTS' as const;
const REMOVE_SELECTABLE_OBJECTS = 'selectingDataAction/REMOVE_SELECTABLE_OBJECTS' as const;
const REMOVE_SELECTABLE_CONTROLLERS = 'selectingDataAction/REMOVE_SELECTABLE_CONTROLLERS' as const;
const REMOVE_SELECTABLE_JOINTS = 'selectingDataAction/REMOVE_SELECTABLE_JOINTS' as const;
const UNRENDER_ASSET = 'selectingDataAction/UNRENDER_ASSET' as const;

const DEFAULT_SINGLE_SELECT = 'selectingDataAction/DEFAULT_SINGLE_SELECT' as const;
const DEFAULT_MULTI_SELECT = 'selectingDataAction/DEFAULT_MULTI_SELECT' as const;

const CTRL_KEY_SINGLE_SELECT = 'selectingDataAction/CTRL_KEY_SINGLE_SELECT' as const;
const CTRL_KEY_MULTI_SELECT = 'selectingDataAction/CTRL_KEY_MULTI_SELECT' as const;

const SELECT_ALL_SELECTABLE_OBJECTS = 'selectingDataAction/SELECT_ALL_SELECTABLE_OBJECTS' as const;
const RESET_SELECTED_TARGETS = 'selectingDataAction/RESET_SELECTED_TARGETS' as const;
const ADD_ENTITIES = 'selectingDataAction/ADD_ENTITIES' as const;
const REMOVE_ENTITIES = 'selectingDataAction/REMOVE_ENTITIES' as const;

const OVERRIDE = 'selectingDataAction/OVERRIDE' as const;

interface SelectableObjects {
  objects: Array<PlaskTransformNode>;
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
  target: PlaskTransformNode;
}

interface DefaultMultiSelect {
  targets: Array<PlaskTransformNode>;
}

interface CtrlKeySingleSelect {
  target: PlaskTransformNode;
}

interface CtrlKeyMultiSelect {
  targets: Array<PlaskTransformNode>;
}

interface UpdateSelectedTargets {
  targets: Array<PlaskEntity>;
}

/**
 * Make objects selectable with the RP dragBox(add objects to selectable objects).
 * TransformNodes are added when their model is visualized and controllers are added when they are created.
 *
 * @param objects - objects to make selectable
 */
export const updateSelectableObjects = (params: SelectableObjects) => ({
  type: UPDATE_SELECTABLE_OBJECTS,
  payload: {
    ...params,
  },
});

/**
 * Adds selectable objects to the current pool of selectable objects
 *
 * @param objects - objects to add
 */
export const addSelectableObjects = (params: SelectableObjects) => ({
  type: ADD_SELECTABLE_OBJECTS,
  payload: {
    ...params,
  },
});

/**
 * Removes seletable objects from the state
 *
 * @param objects - objects to remove
 */
export const removeSelectableObjects = (params: SelectableObjects) => ({
  type: REMOVE_SELECTABLE_OBJECTS,
  payload: {
    ...params,
  },
});

/**
 * Make controllers unselectable with the RP dragBox(remove controllers from selectable objects).
 *
 * @param assetId - asset's id whose controllers will be removed from the selectable objects
 */
export const removeSelectableControllers = (params: RemoveSelectableControllers) => ({
  type: REMOVE_SELECTABLE_CONTROLLERS,
  payload: {
    ...params,
  },
});

/**
 * Make transformNodes unselectable with the RP dragBox(remove transformNodes from selectable objects).
 *
 * @param assetId - asset's id whose transformNodes will be removed from the selectable objects
 */
export const removeSelectableJoints = (params: RemoveSelectableJoints) => ({
  type: REMOVE_SELECTABLE_JOINTS,
  payload: {
    ...params,
  },
});

/**
 * Make controlloers and transformNodes unselectable with the RP dragBox(remove objects from selectable objects).
 *
 * @param assetId - asset's id whose controllers and transformNodes will be removed from the selectable objects
 */
export const unrenderAsset = (params: UnrenderAsset) => ({
  type: UNRENDER_ASSET,
  payload: {
    ...params,
  },
});

/**
 * Select single target(controller or transformNode).
 * Select only if the target is not currently selected.
 *
 * @param target
 */
export const defaultSingleSelect = (params: DefaultSingleSelect) => ({
  type: DEFAULT_SINGLE_SELECT,
  payload: {
    ...params,
  },
});

/**
 * Select multi targets.
 * Reset current selected targets and select new ones.
 *
 * @param targets
 */
export const defaultMultiSelect = (params: DefaultMultiSelect) => ({
  type: DEFAULT_MULTI_SELECT,
  payload: {
    ...params,
  },
});

/**
 * 1) If clicking currently selected target, exclude that one from the selected.
 * 2) If clicking not selected target, include that one to the selected.
 *
 * @param target
 */
export const ctrlKeySingleSelect = (params: CtrlKeySingleSelect) => ({
  type: CTRL_KEY_SINGLE_SELECT,
  payload: {
    ...params,
  },
});

/**
 * ctrlKeySingleSelect happens to multi targets.
 * 1) If clicking currently selected target, exclude that one from the selected.
 * 2) If clicking not selected target, include that one to the selected.
 *
 * @param targets
 */
export const ctrlKeyMultiSelect = (params: CtrlKeyMultiSelect) => ({
  type: CTRL_KEY_MULTI_SELECT,
  payload: {
    ...params,
  },
});

/**
 * Select all selectable objects.
 */
export const selectAllSelectableObjects = () => ({
  type: SELECT_ALL_SELECTABLE_OBJECTS,
});

/**
 * Updates entities. TODO : should not be undoable
 */
export const addEntity = (params: UpdateSelectedTargets) => ({
  type: ADD_ENTITIES,
  payload: {
    ...params,
  },
});

/**
 * Removes entities.
 */
export const removeEntity = (params: UpdateSelectedTargets) => ({
  type: REMOVE_ENTITIES,
  payload: {
    ...params,
  },
});

/**
 * Make all selected objects unselected
 */
export const resetSelectedTargets = () => ({
  type: RESET_SELECTED_TARGETS,
});

export const override = (params: SelectingData) => ({
  type: OVERRIDE,
  payload: {
    ...params,
  },
});
