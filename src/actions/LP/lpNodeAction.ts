interface State {
  nodes: LP.Node[];
}

export type LPNodeAction =
  | ReturnType<typeof changeNode>
  | ReturnType<typeof visualize>
  | ReturnType<typeof changeCurrentPath>
  | ReturnType<typeof changeClipboard>;

export const CHANGE_NODE = 'mode/CHANGE_NODE' as const;
export const VISUALIZE = 'mode/VISUALIZE' as const;
export const CHANGE_CURRENT_PATH = 'mode/CHANGE_CURRENT_PATH' as const;
export const CHANGE_CLIPBOARD = 'mode/CHANGE_CLIPBOARD' as const;

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
  data: unknown;
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
