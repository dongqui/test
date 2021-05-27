export interface LPPageState {
  key: string;
}

export type LPPageAction = ReturnType<typeof setLPPage>;

export const SET_LPPAGE = 'lppage/SET_LPPAGE' as const;

interface SetLPPage extends LPPageState {}

export const setLPPage = (params: SetLPPage) => ({
  type: SET_LPPAGE,
  payload: {
    ...params,
  },
});
