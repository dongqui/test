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

interface DropNodeOnFolderParams {
  filePath: string;
  nodeId: string;
}

interface DropMocapOnModelParams {
  nodeId: string;
  filePath: string;
  assetId?: string;
}

interface EditNodeNameParams {
  nodeId: string;
  newName: string;
}

interface ExportAssetParams {
  parentId: string;
  type: string;
  assetId: string;
  nodeName: string;
  motion: string;
  format: ExportFormat;
}

interface DeleteMotionParams {
  nodeId: string;
  assetId: string;
  parentId: string;
}
interface FileUploadParams {
  file: File | string;
  showLoading: boolean;
}

interface DeleteLibraryReceiveParam {
  type: 'delete';
  scenesLibraryId: string;
}

interface DropNodeOnFolderSendParam {
  nodeId: string;
  parentId: string;
}

interface DropNodeOnFolderReceiveParam {
  type: 'move';
  data: {
    scenesLibraryIds: string[];
    parentScenesLibraryId: string;
  };
}
export const changeNode = createAction('node/CHANGE_NODE', ({ nodes }: { nodes: LP.Node[] }) => ({ nodes }))();
export const visualizeModel = createAction('node/VISUALIZE_MODEL', (assetId: string) => ({ assetId }))();
export const cancelVisulization = createAction('node/CANCEL_VISUALIZATION', (assetId: string) => ({ assetId }))();
export const visualizeMotion = createAction('node/VISUALIZE_MOTION', (params: VisualizeMotionParams) => ({ ...params }))();
export const selectNode = createAction('node/SELECT_NODE', (params: SelectNodeParams) => ({ ...params }))();
export const setDraggedNode = createAction('node/SET_DRAGGED_NODE', (node: LP.Node | null) => ({ node }))();
export const setEditingNodeId = createAction('node/SET_EDITING_NODE_ID', (nodeId: string | null) => ({ nodeId }))();

export const addEmptyMotion = createAction('node/ADD_EMPTY_MOTION', (params: AddEmptyMotionParams) => ({ ...params }))();
export const duplicateMotion = createAction('node/DUPLICATE_MOTION', (params: DuplicateMotionParams) => ({ ...params }))();
export const dropMocapOnModel = createAction('node/DROP_MOCAP_ON_MODEL', (params: DropMocapOnModelParams) => ({ ...params }))();
export const editNodeName = createAction('node/EDIT_NODE_NAME', (params: EditNodeNameParams) => ({ ...params }))();
export const exportAsset = createAction('node/EXPORT', (params: ExportAssetParams) => ({ ...params }))();
export const deleteMotion = createAction('node/DELETE_MOTION', (params: DeleteMotionParams) => ({ ...params }))();
export const fileUpload = createAction('node/FILE_UPLOAD', (params: FileUploadParams) => ({ ...params }))();
export const addNodes = createAction('node/ADD_NODES', (nodes: LP.Node[]) => ({ nodes }))();
export const dropNodeOnRoot = createAction('node/DROP_NODE_ON_ROOT')();

export const getNodesAsync = createAsyncAction('node/GET_NODE_REQUEST', 'node/GET_NODE_SUCCESS', 'node/GET_NODE_FAILURE')<undefined, { nodes: LP.Node[] }, Error>();
export const addDirectoryAsync = createAsyncAction('node/POST_FOLRDER_REQUEST', 'node/POST_FOLRDER_SUCCESS', 'node/POST_FOLRDER_FAILURE')<AddDirectoryParams, LP.Node, Error>();

// export const deleteFolderOrMocap = createAction('node/DELETE_FOLDER_OR_MOCAP', (params: DeleteFolderOrMocapParams) => ({ ...params }))();
export const deleteFolderOrMocapSocket = createSocketActions(
  'node/DELETE_FOLRDER_OR_MOCAP_REQUEST',
  'node/DELETE_FOLRDER_OR_MOCAP_SEND',
  'node/DELETE_FOLRDER_OR_MOCAP_RECEIVE',
  'node/DELETE_FOLRDER_OR_MOCAP_UPDATE',
  'node/DELETE_FOLRDER_OR_MOCAP_FAILURE',
)<string, string, DeleteLibraryReceiveParam, LP.Node[], string>();

export const deleteModel = createAction('node/DELETE_MODEL', (params: DeleteModelParams) => ({ ...params }))();
export const deleteModelSocket = createSocketActions(
  'node/DELETE_MODEL_REQUEST',
  'node/DELETE_MODEL_SEND',
  'node/DELETE_MODEL_RECEIVE',
  'node/DELETE_MODEL_UPDATE',
  'node/DELETE_MODEL_FAILURE',
)<string, string, DeleteLibraryReceiveParam, LP.Node[], string>();

export const dropNodeOnFolder = createAction('node/DROP_NODE_ON_FOLDER', (params: DropNodeOnFolderParams) => ({ ...params }))();
export const dropNodeOnFolderSocket = createSocketActions(
  'node/DROP_NODE_ON_FOLDER_REQUEST',
  'node/DROP_NODE_ON_FOLDER_SEND',
  'node/DROP_NODE_ON_FOLDER_RECEIVE',
  'node/DROP_NODE_ON_FOLDER_UPDATE',
  'node/DROP_NODE_ON_FOLDER_FAILURE',
)<string, DropNodeOnFolderSendParam, DropNodeOnFolderReceiveParam, LP.Node[], string>();
