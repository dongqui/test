export interface LPPageState {
  key: string;
  name: string;
}

export type LPPageAction = ReturnType<typeof setLPMode>;

export const SET_LPPAGE = 'lppage/SET_LPPAGE' as const;

interface SetLPPage extends LPPageState {}

export const setLPMode = (params: SetLPPage) => ({
  type: SET_LPPAGE,
  payload: {
    ...params,
  },
});
