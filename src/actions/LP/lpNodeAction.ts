interface State {
  nodes: LP.Node[];
}

export type LPNodeAction =
  | ReturnType<typeof changeNode>
  | ReturnType<typeof visualize>
  | ReturnType<typeof changeCurrentPath>
  | ReturnType<typeof changeClipboard>
  | ReturnType<typeof deleteNode>
  | ReturnType<typeof changeNode>
  | ReturnType<typeof addDirectory>;

export const CHANGE_NODE = 'node/CHANGE_NODE' as const;
export const VISUALIZE = 'node/VISUALIZE' as const;
export const CHANGE_CURRENT_PATH = 'node/CHANGE_CURRENT_PATH' as const;
export const CHANGE_CLIPBOARD = 'node/CHANGE_CLIPBOARD' as const;
export const DELETE_NODE = 'node/DELETE_NODE' as const;
export const COPY_NODE = 'node/COPY_NODE' as const;
export const ADD_DIRECTORY = 'node/ADD_DIRECTORY' as const;
interface ChangeNodeParams {
  nodes: LP.Node[];
}
interface VisualizeParams {
  fileURL: string;
}

interface ChangeCurrentPathParams {
  currentPath: string;
  id: string;
}

interface ChangeClipboardParams {
  data: LP.Node[];
}

interface DeleteNodeParams {
  nodeId: string;
  selectAssetId?: string;
}

interface AddDirectoryParams {
  nodeId: string;
  filePath: string;
  extension: string;
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

export const deleteNode = (params: DeleteNodeParams) => ({
  type: DELETE_NODE,
  payload: {
    ...params,
  },
});

export const copyNode = (nodeId: string) => ({
  type: DELETE_NODE,
  payload: {
    id: nodeId,
  },
});

export const addDirectory = (params: AddDirectoryParams) => ({
  type: ADD_DIRECTORY,
  payload: {
    ...params,
  },
});
