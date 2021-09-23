import { LPSearchwordType } from 'types/LP';

export type LPSearchwordAction = ReturnType<typeof setSearchword>;

type RequestSetSearchword = Pick<LPSearchwordType, 'word'>;
export const REQUEST_SET_SEARCHWORD = 'lpSearchword/REQUEST_SET_SEARCHWORD' as const;
export const requestSetSearchword = (params: RequestSetSearchword) => ({
  type: REQUEST_SET_SEARCHWORD,
  payload: params,
});

type SetSearchword = Pick<LPSearchwordType, 'word'>;
export const SET_SEARCHWORD = 'lpSearchword/SET_SEARCHWORD' as const;
export const setSearchword = (params: SetSearchword) => ({
  type: SET_SEARCHWORD,
  payload: params,
});
