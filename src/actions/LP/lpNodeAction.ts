interface State {
  nodes: LP.Node[];
}

export type LPNodeAction =
  | ReturnType<typeof changeNode>
  | ReturnType<typeof visualize>
  | ReturnType<typeof changeCurrentPath>;

export const CHANGE_NODE = 'mode/CHANGE_NODE' as const;
export const VISUALIZE = 'mode/VISUALIZE' as const;
export const CHANGE_CURRENT_PATH = 'mode/CHANGE_CURRENT_PATH' as const;

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
