export type ModeSelectionAction = ReturnType<typeof changeMode>;
export interface ChangeMode {
  mode?: 'animationMode' | 'videoMode' | 'unmountVideoMode';
  videoURL?: File;
}

export const CHANGE_MODE = 'modeSelection/CHANGE_MODE' as const;

export const changeMode = (params: ChangeMode) => ({
  type: CHANGE_MODE,
  payload: params,
});
