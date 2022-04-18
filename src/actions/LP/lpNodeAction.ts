import { createAction, createAsyncAction } from 'typesafe-actions';

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
  filePath: string;
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

interface MoveNodeParams {
  filePath: string;
  nodeId: string;
}

interface DropMocapOnModelParams {
  nodeId: string;
  filePath: string;
  assetId?: string;
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

interface FileUploadParams {
  file: File | string;
  showLoading: boolean;
}
interface DeleteNodeReceiveParam {
  type: 'delete';
  scenesLibraryId: string;
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
interface DeleteMotionReceiveParam {
  type: 'delete';
  data: {
    animationId: string;
  };
}

interface DeleteNodeSendParams {
  type: 'delete';
  scenesLibraryId: string;
}

export const changeNode = createAction('node/CHANGE_NODE', ({ nodes }: { nodes: LP.Node[] }) => ({ nodes }))();
export const visualizeModel = createAction('node/VISUALIZE_MODEL', (assetId: string) => ({ assetId }))();
export const cancelVisulization = createAction('node/CANCEL_VISUALIZATION', (assetId: string) => ({ assetId }))();
export const visualizeMotion = createAction('node/VISUALIZE_MOTION', (params: VisualizeMotionParams) => ({ ...params }))();
export const selectNode = createAction('node/SELECT_NODE', (params: SelectNodeParams) => ({ ...params }))();
export const setDraggedNode = createAction('node/SET_DRAGGED_NODE', (node: LP.Node | null) => ({ node }))();
export const setEditingNodeId = createAction('node/SET_EDITING_NODE_ID', (nodeId: string | null) => ({ nodeId }))();
export const addNodes = createAction('node/ADD_NODES', (nodes: LP.Node[]) => ({ nodes }))();
export const exportAsset = createAction('node/EXPORT', (params: ExportAssetParams) => ({ ...params }))();

export const addEmptyMotion = createAction('node/ADD_EMPTY_MOTION', (params: AddEmptyMotionParams) => ({ ...params }))();
export const duplicateMotion = createAction('node/DUPLICATE_MOTION', (params: DuplicateMotionParams) => ({ ...params }))();
export const fileUpload = createAction('node/FILE_UPLOAD', (params: FileUploadParams) => ({ ...params }))();

export const getNodesAsync = createAsyncAction('node/GET_NODE_REQUEST', 'node/GET_NODE_SUCCESS', 'node/GET_NODE_FAILURE')<undefined, LP.Node[], Error>();
export const addDirectoryAsync = createAsyncAction('node/POST_FOLRDER_REQUEST', 'node/POST_FOLRDER_SUCCESS', 'node/POST_FOLRDER_FAILURE')<AddDirectoryParams, LP.Node, Error>();
export const addModelAsync = createAsyncAction('node/POST_MODEL_REQUEST', 'node/POST_MODEL_SUCCESS', 'node/POST_MODEL_FAILURE')<File, LP.Node[], Error>();

// export const deleteFolderOrMocap = createAction('node/DELETE_FOLDER_OR_MOCAP', (params: DeleteFolderOrMocapParams) => ({ ...params }))();
export const deleteNodeSocket = createSocketActions(
  'node/DELETE_NODE_REQUEST',
  'node/DELETE_NODE_SEND',
  'node/DELETE_NODE_RECEIVE',
  'node/DELETE_NODE_UPDATE',
  'node/DELETE_NODE_FAILURE',
)<string, DeleteNodeSendParams, DeleteNodeReceiveParam, LP.Node[], string>();

export const deleteModel = createAction('node/DELETE_MODEL', (params: DeleteModelParams) => ({ ...params }))();
export const deleteModelSocket = createSocketActions(
  'node/DELETE_MODEL_REQUEST',
  'node/DELETE_MODEL_SEND',
  'node/DELETE_MODEL_RECEIVE',
  'node/DELETE_MODEL_UPDATE',
  'node/DELETE_MODEL_FAILURE',
)<string, DeleteNodeSendParams, DeleteNodeReceiveParam, LP.Node[], string>();

export const dropNodeOnFolderOrRoot = createAction('node/MOVE_NODE', (params: MoveNodeParams) => ({ ...params }))();
export const moveNodeSocket = createSocketActions(
  'node/MOVE_NODE_OR_ROOT_REQUEST',
  'node/MOVE_NODE_OR_ROOT_SEND',
  'node/MOVE_NODE_OR_ROOT_RECEIVE',
  'node/MOVE_NODE_OR_ROOT_UPDATE',
  'node/MOVE_NODE_OR_ROOT_FAILURE',
)<string, MoveNodeSendParam, MoveNodeReceiveParam, LP.Node[], string>();

export const editNodeName = createAction('node/EDIT_NODE_NAME', (params: EditNodeNameRequestParams) => ({ ...params }))();
export const editNodeNameSocket = createSocketActions(
  'node/UPDATE_NODE_NAME_REQUEST',
  'node/UPDATE_NODE_NAME_SEND',
  'node/UPDATE_NODE_NAME_RECEIVE',
  'node/UPDATE_NODE_NAME_UPDATE',
  'node/UPDATE_NODE_NAME_FAILURE',
)<EditNodeNameRequestParams, EditNodeNameSendParams, EditNodeNameReceiveParam, LP.Node[], string>();

export const dropMocapOnModel = createAction('node/DROP_MOCAP_ON_MODEL', (params: DropMocapOnModelParams) => ({ ...params }))();
export const applyMocapToModelSocket = createSocketActions(
  'node/APPLY_MOCAP_TO_MODEL_REQUEST',
  'node/APPLY_MOCAP_TO_MODEL_SEND',
  'node/APPLY_MOCAP_TO_MODEL_RECEIVE',
  'node/APPLY_MOCAP_TO_MODEL_UPDATE',
  'node/APPLY_MOCAP_TO_MODEL_FAILURE',
)<EditNodeNameRequestParams, EditNodeNameRequestParams, EditNodeNameReceiveParam, LP.Node[], string>();

export const deleteMotion = createAction('node/DELETE_MOTION', (nodeId: string) => nodeId)();
export const deleteMotionSocket = createSocketActions(
  'node/DELETE_MOTION_REQUEST',
  'node/DELETE_MOTION_SEND',
  'node/DELETE_MOTION_RECEIVE',
  'node/DELETE_MOTION_UPDATE',
  'node/DELETE_MOTION_FAILURE',
)<string, string, DeleteMotionReceiveParam, LP.Node[], string>();
