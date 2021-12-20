export type ModeSelectionAction = ReturnType<typeof changeMode>;
export interface ChangeMode {
  mode: 'Animation' | 'Retargeting';
}

export const CHANGE_MODE = 'modeSelection/CHANGE_MODE' as const;

export const changeMode = (params: ChangeMode) => ({
  type: CHANGE_MODE,
  payload: params,
});
