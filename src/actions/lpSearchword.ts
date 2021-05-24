export interface LPSearchwordState {
  word: string;
}

export type LPSearchwordAction = ReturnType<typeof setSearchword>;

export const SET_SEARCHWORD = 'lpSearchword/SET_SEARCHWORD' as const;

interface SetSearchword extends LPSearchwordState {}

export const setSearchword = (params: SetSearchword) => ({
  type: SET_SEARCHWORD,
  payload: {
    ...params,
  },
});
