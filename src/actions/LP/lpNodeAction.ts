import { createAction, createAsyncAction } from 'typesafe-actions';

import { ExportFormat } from 'types/common';

interface DeleteModelParams {
  nodeId: string;
  assetId: string;
  parentId?: string;
}

interface DeleteFolderOrMocapParams {
  nodeId: string;
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

export const changeNode = createAction('node/CHANGE_NODE', ({ nodes }: { nodes: LP.Node[] }) => ({ nodes }))();
export const deleteFolderOrMocap = createAction('node/DELETE_FOLDER_OR_MOCAP', (params: DeleteFolderOrMocapParams) => ({ ...params }))();
export const deleteModel = createAction('node/DELETE_MODEL', (params: DeleteModelParams) => ({ ...params }))();
export const visualizeModel = createAction('node/VISUALIZE_MODEL', (assetId: string) => ({ assetId }))();
export const cancelVisulization = createAction('node/CANCEL_VISUALIZATION', (assetId: string) => ({ assetId }))();
export const addEmptyMotion = createAction('node/ADD_EMPTY_MOTION', (params: AddEmptyMotionParams) => ({ ...params }))();
export const duplicateMotion = createAction('node/DUPLICATE_MOTION', (params: DuplicateMotionParams) => ({ ...params }))();
export const visualizeMotion = createAction('node/VISUALIZE_MOTION', (params: VisualizeMotionParams) => ({ ...params }))();
export const selectNode = createAction('node/SELECT_NODE', (params: SelectNodeParams) => ({ ...params }))();
export const dropNodeOnFolder = createAction('node/DROP_NODE_ON_FOLDER', (params: DropNodeOnFolderParams) => ({ ...params }))();
export const setDraggedNode = createAction('node/SET_DRAGGED_NODE', (node: LP.Node | null) => ({ node }))();
export const dropMocapOnModel = createAction('node/DROP_MOCAP_ON_MODEL', (params: DropMocapOnModelParams) => ({ ...params }))();
export const setEditingNodeId = createAction('node/SET_EDITING_NODE_ID', (nodeId: string | null) => ({ nodeId }))();
export const editNodeName = createAction('node/EDIT_NODE_NAME', (params: EditNodeNameParams) => ({ ...params }))();
export const exportAsset = createAction('node/EXPORT', (params: ExportAssetParams) => ({ ...params }))();
export const deleteMotion = createAction('node/DELETE_MOTION', (params: DeleteMotionParams) => ({ ...params }))();
export const fileUpload = createAction('node/FILE_UPLOAD', (params: FileUploadParams) => ({ ...params }))();
export const addNodes = createAction('node/ADD_NODES', (nodes: LP.Node[]) => ({ nodes }))();
export const dropNodeOnRoot = createAction('node/DROP_NODE_ON_ROOT')();

export const getNodesAsync = createAsyncAction('node/GET_NODE_REQUEST', 'node/GET_NODE_SUCCESS', 'node/GET_NODE_FAILURE')<undefined, { nodes: LP.Node[] }, Error>();
export const addDirectoryAsync = createAsyncAction('node/POST_FOLRDER_REQUEST', 'node/POST_FOLRDER_SUCCESS', 'node/POST_FOLRDER_FAILURE')<AddDirectoryParams, LP.Node, Error>();