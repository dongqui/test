import { ExportFormat } from 'types/common';

export const CHANGE_NODE = 'node/CHANGE_NODE' as const;
export const VISUALIZE = 'node/VISUALIZE' as const;
export const CHANGE_CURRENT_PATH = 'node/CHANGE_CURRENT_PATH' as const;
export const CHANGE_CLIPBOARD = 'node/CHANGE_CLIPBOARD' as const;
export const DELETE_FOLDER_OR_MOCAP = 'node/DELETE_FOLDER_OR_MOCAP' as const;
export const COPY_NODE = 'node/COPY_NODE' as const;
export const ADD_DIRECTORY = 'node/ADD_DIRECTORY' as const;
export const VISUALIZE_NODE = 'node/VISUALIZE_NODE' as const;
export const CANCEL_VISUALIZATION = 'node/CANCEL_VISUALIZATION' as const;
export const ADD_EMPTY_MOTION = 'node/ADD_EMPTY_MOTION' as const;
export const DUPLICATE_MOTION = 'node/DUPLICATE_MOTION' as const;
export const VISUALIZE_MOTION = 'node/VISUALIZE_MOTION' as const;
export const SELECT_NODE = 'node/SELECT_NODE' as const;
export const DROP_NODE_ON_FOLDER = 'node/DROP_NODE_ON_FOLDER' as const;
export const SET_DRAGGED_NODE = 'node/SET_DRAGGED_NODE' as const;
export const DROP_MOCAP_ON_MODEL = 'node/DROP_MOCAP_ON_MODEL' as const;
export const SET_EDITING_NODE_ID = 'node/SET_EDITING_NODE_ID' as const;
export const EDIT_NODE_NAME = 'node/EDIT_NODE_NAME' as const;
export const EXPORT_ASSET = 'node/EXPORT' as const;
export const DELETE_MOTION = 'node/DELETE_MOTION' as const;
export const FILE_UPLOAD = 'node/FILE_UPLOAD' as const;
export const ADD_NODES = 'node/ADD_NODES' as const;
export const DELETE_MODEL = 'node/DELETE_MODEL' as const;

interface ChangeNodeParams {
  nodes: LP.Node[];
}
interface ChangeCurrentPathParams {
  currentPath: string;
  id: string;
}

interface ChangeClipboardParams {
  data: LP.Node[];
}

interface DeleteFolderOrMocapParams {
  nodeId: string;
  parentId?: string;
}
interface DeleteMotionParams {
  nodeId: string;
  assetId: string;
  parentId: string;
}

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
  extension: string;
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

interface FileUploadParams {
  file: File | string;
}

export const changeNode = (params: ChangeNodeParams) => ({
  type: CHANGE_NODE,
  payload: {
    ...params,
  },
});

export const visualize = (params: string | File) => ({
  type: VISUALIZE,
  payload: params,
});

export const changeCurrentPath = (params: ChangeCurrentPathParams) => ({
  type: CHANGE_CURRENT_PATH,
  payload: {
    ...params,
  },
});

export const changeClipboard = (params: ChangeClipboardParams) => ({
  type: CHANGE_CLIPBOARD,
  payload: {
    ...params,
  },
});

export const deleteFolderOrMocap = (params: DeleteFolderOrMocapParams) => ({
  type: DELETE_FOLDER_OR_MOCAP,
  payload: {
    ...params,
  },
});

export const deleteModel = (params: DeleteModelParams) => ({
  type: DELETE_MODEL,
  payload: {
    ...params,
  },
});

export const addDirectory = (params: AddDirectoryParams) => ({
  type: ADD_DIRECTORY,
  payload: {
    ...params,
  },
});

export const visualizeNode = (assetId: string) => ({
  type: VISUALIZE_NODE,
  payload: {
    assetId,
  },
});

export const cancelVisulization = (assetId: string) => ({
  type: CANCEL_VISUALIZATION,
  payload: {
    assetId,
  },
});

export const addEmptyMotion = (params: AddEmptyMotionParams) => ({
  type: ADD_EMPTY_MOTION,
  payload: {
    ...params,
  },
});

export const duplicateMotion = (params: DuplicateMotionParams) => ({
  type: DUPLICATE_MOTION,
  payload: {
    ...params,
  },
});

export const visualizeMotion = (params: VisualizeMotionParams) => ({
  type: VISUALIZE_MOTION,
  payload: {
    ...params,
  },
});

export const selectNode = (params: SelectNodeParams) => ({
  type: SELECT_NODE,
  payload: {
    ...params,
  },
});

export const dropNodeOnFolder = (params: DropNodeOnFolderParams) => ({
  type: DROP_NODE_ON_FOLDER,
  payload: {
    ...params,
  },
});

export const setDraggedNode = (node: LP.Node | null) => ({
  type: SET_DRAGGED_NODE,
  payload: {
    node,
  },
});

export const dropMocapOnModel = (params: DropMocapOnModelParams) => ({
  type: DROP_MOCAP_ON_MODEL,
  payload: {
    ...params,
  },
});

export const setEditingNodeId = (nodeId: string | null) => ({
  type: SET_EDITING_NODE_ID,
  payload: {
    nodeId,
  },
});

export const editNodeName = (params: EditNodeNameParams) => ({
  type: EDIT_NODE_NAME,
  payload: {
    ...params,
  },
});

export const exportAsset = (params: ExportAssetParams) => ({
  type: EXPORT_ASSET,
  payload: {
    ...params,
  },
});

export const deleteMotion = (params: DeleteMotionParams) => ({
  type: DELETE_MOTION,
  payload: {
    ...params,
  },
});

export const fileUpload = (params: FileUploadParams) => ({
  type: FILE_UPLOAD,
  payload: {
    ...params,
  },
});

export const addNodes = (nodes: LP.Node[]) => ({
  type: ADD_NODES,
  payload: {
    nodes,
  },
});

export type LPNodeAction =
  | ReturnType<typeof changeNode>
  | ReturnType<typeof visualize>
  | ReturnType<typeof changeCurrentPath>
  | ReturnType<typeof changeClipboard>
  | ReturnType<typeof deleteFolderOrMocap>
  | ReturnType<typeof deleteModel>
  | ReturnType<typeof deleteMotion>
  | ReturnType<typeof changeNode>
  | ReturnType<typeof addDirectory>
  | ReturnType<typeof visualizeNode>
  | ReturnType<typeof addEmptyMotion>
  | ReturnType<typeof selectNode>
  | ReturnType<typeof dropNodeOnFolder>
  | ReturnType<typeof setDraggedNode>
  | ReturnType<typeof dropMocapOnModel>
  | ReturnType<typeof setEditingNodeId>
  | ReturnType<typeof editNodeName>
  | ReturnType<typeof exportAsset>
  | ReturnType<typeof fileUpload>
  | ReturnType<typeof addNodes>;
