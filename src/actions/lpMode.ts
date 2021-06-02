import { LPModeType } from 'types/LP';

export type LPModeAction = ReturnType<typeof setLPMode>;

type SetLPMode = Pick<LPModeType, 'mode'>;
export const SET_LPMODE = 'lpmode/SET_LPMODE' as const;
export const setLPMode = (params: SetLPMode) => ({
  type: SET_LPMODE,
  payload: params,
});
