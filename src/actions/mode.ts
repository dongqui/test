export type Mode = 'shoot' | 'video';
export type ModeAction = ReturnType<typeof changeMode>;

export type ModeState = {
  mode: Mode;
};

export const CHANGE_MODE = 'CHANGE_MODE';

export const changeMode = (mode: Mode) => {
  return {
    type: CHANGE_MODE,
    mode,
  };
};
