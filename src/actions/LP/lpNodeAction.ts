interface State {
  node: any;
}

export type LPNodeAction = ReturnType<typeof changeNode>;

export const CHANGE_NODE = 'mode/CHANGE_NODE' as const;

interface changeNode {}

export const changeNode = (params: changeNode) => ({
  type: CHANGE_NODE,
  payload: {
    ...params,
  },
});
