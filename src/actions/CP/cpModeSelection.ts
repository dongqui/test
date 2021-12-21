export type CpModeSwitchAction = ReturnType<typeof switchMode>;
export interface SwitchCpMode {
  mode: 'Animation' | 'Retargeting';
}

export const SWITCH_CP_MODE = 'modeSelection/SWITCH_CP_MODE' as const;

export const switchMode = (params: SwitchCpMode) => ({
  type: SWITCH_CP_MODE,
  payload: params,
});
