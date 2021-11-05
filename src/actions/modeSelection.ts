import { ModeSelectionType } from 'types';

export type ModeSelectionAction = ReturnType<typeof setMode>;

type SetMode = ModeSelectionType;

export const SET_MODE = 'modeSelection/SET_MODE' as const;
export const setMode = (params: SetMode) => ({
  type: SET_MODE,
  payload: params.mode,
});
