export type CPDataAction = ReturnType<typeof setCPTab>;

interface SetCPTab {
  tabIndex: number;
}
export const SET_CP_TAB = 'cpData/SET_CP_TAB' as const;
export const setCPTab = (params: SetCPTab) => ({
  type: SET_CP_TAB,
  payload: {
    ...params,
  },
});
