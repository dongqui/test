import { BarPositionXType } from 'types/VM';

export type BarPositionXAction = ReturnType<typeof setBarPositionX>;

type SetBarPositionX = BarPositionXType;

export const SET_BARPOSITION_X = 'barPositionX/SET_BARPOSITION_X' as const;
export const setBarPositionX = (params: SetBarPositionX) => ({
  type: SET_BARPOSITION_X,
  payload: params,
});
