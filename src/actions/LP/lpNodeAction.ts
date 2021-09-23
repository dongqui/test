interface State {
  nodes: LP.Node[];
}

export type LPNodeAction = ReturnType<typeof changeNode> | ReturnType<typeof visualize>;

export const CHANGE_NODE = 'mode/CHANGE_NODE' as const;
export const VISUALIZE = 'mode/VISUALIZE' as const;

interface ChangeNodeParams {
  nodes: LP.Node[];
}
interface VisualizeParams {
  fileURL: string;
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
