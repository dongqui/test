import { LPPageListOldType, LPPageType } from 'types/LP';

export type LPPageAction = ReturnType<typeof setLPPage>;

type SetLPPage = Pick<LPPageType, 'key'>;
export const SET_LPPAGE = 'lppage/SET_LPPAGE' as const;
export const setLPPage = (params: SetLPPage) => ({
  type: SET_LPPAGE,
  payload: params,
});

export type LPPageOldAction = ReturnType<typeof setLPPageOld>;

type SetLPPageOld = LPPageListOldType;
export const SET_LPPAGE_OLD = 'lppage/SET_LPPAGE_OLD' as const;
export const setLPPageOld = (params: SetLPPageOld) => ({
  type: SET_LPPAGE_OLD,
  payload: params,
});
