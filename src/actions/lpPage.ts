import { LPPageType } from 'types/LP';

export type LPPageAction = ReturnType<typeof setLPPage>;

type SetLPPage = Pick<LPPageType, 'key'>;
export const SET_LPPAGE = 'lppage/SET_LPPAGE' as const;
export const setLPPage = (params: SetLPPage) => ({
  type: SET_LPPAGE,
  payload: params,
});
