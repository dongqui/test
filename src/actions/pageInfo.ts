import { PageInfoType } from 'types';

export type PageInfoAction = ReturnType<typeof setPageInfo>;

type SetPageInfo = PageInfoType;
export const SET_PAGEINFO = 'pageInfo/SET_PAGEINFO' as const;
export const setPageInfo = (params: SetPageInfo) => ({
  type: SET_PAGEINFO,
  payload: params,
});
