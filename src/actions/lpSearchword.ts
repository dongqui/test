import { LPSearchwordType } from 'types/LP';

export type LPSearchwordAction = ReturnType<typeof setSearchword>;

type SetSearchword = Pick<LPSearchwordType, 'word'>;
export const SET_SEARCHWORD = 'lpSearchword/SET_SEARCHWORD' as const;
export const setSearchword = (params: SetSearchword) => ({
  type: SET_SEARCHWORD,
  payload: params,
});
