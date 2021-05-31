export type LPMode = 'listView' | 'iconView';
export interface LPModeState {
  mode: LPMode;
}

export type LPModeAction = ReturnType<typeof setLPMode>;

export const SET_LPMODE = 'lpmode/SET_LPMODE' as const;

interface SetLPMode extends LPModeState {}

export const setLPMode = (params: SetLPMode) => ({
  type: SET_LPMODE,
  payload: {
    ...params,
  },
});
