import { createAction, createAsyncAction } from 'typesafe-actions';

import { RequestNodeResponse } from 'types/LP';
import { ExportFormat } from 'types/common';
import { createSocketActions } from '../helper';

interface DeleteModelParams {
  nodeId: string;
  assetId: string;
  parentId?: string;
}
interface AddEmptyMotionParams {
  nodeId: string;
  assetId: string;
}
interface AddDirectoryParams {
  nodeId: string;
}
interface DuplicateMotionParams {
  parentId: string;
  nodeName: string;
  nodeId: string;
}

interface VisualizeMotionParams {
  parentId: string;
  assetId?: string;
  nodeId: string;
}

interface SelectNodeParams {
  nodeId: string | null;
  assetId?: string | null;
}

interface EditNodeNameRequestParams {
  nodeId: string;
  newName: string;
}

interface EditNodeNameSendParams {
  type: 'update-name' | 'rename';
  scenesLibraryId: string;
  data: {
    name: string;
  };
}

interface ExportAssetParams {
  parentId: string;
  type: string;
  assetId: string;
  nodeName: string;
  motion: string;
  format: ExportFormat;
}

interface MoveNodeSendParam {
  type: 'move';
  data: {
    scenesLibraryIds: string[];
    parentScenesLibraryId: string;
  };
}

interface MoveNodeReceiveParam {
  type: 'move';
  data: {
    scenesLibraryIds: string[];
    parentScenesLibraryId: string;
  };
}

interface EditNodeNameReceiveParam {
  type: 'update-name';
  scenesLibraryId: string;
  data: {
    name: string;
  };
}
interface DeleteNodeSendParams {
  type: 'delete';
  scenesLibraryId: string;
  data: {
    descendantIds: string[];
  };
}
interface DeleteNodeReceiveParam {
  type: 'delete';
  scenesLibraryId: string;
  data: {
    descendantIds: string[];
  };
}

interface ApplyMocapToModelRequestParams {
  nodeId: string;
  assetId?: string;
  mocapId: string;
}

export const addAssetsAndAnimationIngredients = createAction('node/ADD_ASSETS_AND_ANIMATION_INGRIDIENTS', (modelNode: LP.Node, motionNodeId?: string) => ({
  modelNode,
  motionNodeId,
}))();
export const changeNode = createAction('node/CHANGE_NODE', ({ nodes }: { nodes: LP.Node[] }) => ({ nodes }))();
export const visualizeModel = createAction('node/VISUALIZE_MODEL', (modelNode: LP.Node, animationIngredientId?: string) => ({ modelNode, animationIngredientId }))();
export const visualize = createAction('node/VISUALIZE_MODEL', (node: LP.Node) => node)();
export const cancelVisulization = createAction('node/CANCEL_VISUALIZATION', (assetId: string) => ({ assetId }))();
export const visualizeMotion = createAction('node/VISUALIZE_MOTION', (params: VisualizeMotionParams) => ({ ...params }))();
export const selectNode = createAction('node/SELECT_NODE', (params: SelectNodeParams) => ({ ...params }))();
export const setDraggedNode = createAction('node/SET_DRAGGED_NODE', (node: LP.Node | null) => ({ node }))();
export const setEditingNodeId = createAction('node/SET_EDITING_NODE_ID', (nodeId: string | null) => ({ nodeId }))();
export const addNodes = createAction('node/ADD_NODES', (nodes: LP.Node[]) => ({ nodes }))();
export const exportAsset = createAction('node/EXPORT', (params: ExportAssetParams) => ({ ...params }))();
export const setSceneId = createAction('node/SET_SCENE_ID', (sceneId: string) => sceneId)();
export const deleteModel = createAction('node/DELETE_MODEL', (params: DeleteModelParams) => ({ ...params }))();
export const deleteMotion = createAction('node/DELETE_MOTION', (nodeId: string) => nodeId)();
export const initNodes = createAction('node/INIT_NODES', (nodesFromServer: RequestNodeResponse[]) => nodesFromServer)();
export const fileUpload = createAction('node/FILE_UPLOAD', (files: File[]) => files)();
export const importMocapJson = createAction('node/IMPORT_MOCAP_JSON', (mocapJson: File) => mocapJson)();

export const addEmptyMotionAsync = createAsyncAction('node/ADD_EMPTY_MOTION_REQUEST', 'node/ADD_EMPTY_MOTION_SUCCESS', 'node/ADD_EMPTY_MOTION_FAILURE')<
  AddEmptyMotionParams,
  LP.Node,
  Error
>();

export const addDirectoryAsync = createAsyncAction('node/POST_FOLRDER_REQUEST', 'node/POST_FOLRDER_SUCCESS', 'node/POST_FOLRDER_FAILURE')<AddDirectoryParams, LP.Node, Error>();

export const addModelAsync = createAsyncAction('node/POST_MODEL_REQUEST', 'node/POST_MODEL_SUCCESS', 'node/POST_MODEL_FAILURE')<File, { nodes: LP.Node[] }, Error>();

export const initDefaultSceneModelData = createAsyncAction(
  'node/INIT_DEFAULT_SCENE_MODEL_DATA_REQUEST',
  'node/INIT_DEFAULT_SCENE_MODEL_DATA_SUCCESS',
  'node/INIT_DEFAULT_SCENE_MODEL_DATA_FAILURE',
)<LP.Node[], LP.Node[], Error>();

export const applyMocapToModel = createAsyncAction('node/APPLY_MOCAP_TO_MODEL_REQUEST', 'node/APPLY_MOCAP_TO_MODEL_SUCCESS', 'node/APPLY_MOCAP_TO_MODEL_FAILURE')<
  ApplyMocapToModelRequestParams,
  LP.Node[],
  Error
>();

export const duplicateMotionAsync = createAsyncAction('node/DUPLICATE_MOTION_REQUEST', 'node/DUPLICATE_MOTIONSUCCESS', 'node/DUPLICATE_MOTION_FAILURE')<
  DuplicateMotionParams,
  LP.Node[],
  Error
>();

export const deleteNodeSocket = createSocketActions(
  'node/DELETE_NODE_REQUEST',
  'node/DELETE_NODE_SEND',
  'node/DELETE_NODE_RECEIVE',
  'node/DELETE_NODE_UPDATE',
  'node/DELETE_NODE_FAILURE',
)<string, DeleteNodeSendParams, DeleteNodeReceiveParam, LP.Node[], string>();

export const moveNodeSocket = createSocketActions(
  'node/MOVE_NODE_OR_ROOT_REQUEST',
  'node/MOVE_NODE_OR_ROOT_SEND',
  'node/MOVE_NODE_OR_ROOT_RECEIVE',
  'node/MOVE_NODE_OR_ROOT_UPDATE',
  'node/MOVE_NODE_OR_ROOT_FAILURE',
)<string, MoveNodeSendParam, MoveNodeReceiveParam, LP.Node[], string>();

export const editNodeNameSocket = createSocketActions(
  'node/UPDATE_NODE_NAME_REQUEST',
  'node/UPDATE_NODE_NAME_SEND',
  'node/UPDATE_NODE_NAME_RECEIVE',
  'node/UPDATE_NODE_NAME_UPDATE',
  'node/UPDATE_NODE_NAME_FAILURE',
)<EditNodeNameRequestParams, EditNodeNameSendParams, EditNodeNameReceiveParam, LP.Node[], string>();
