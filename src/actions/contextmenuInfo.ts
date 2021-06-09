import { ContextmenuType } from 'types';

export type ContextMenuInfoAction = ReturnType<typeof setContextmenuInfo>;

type SetContextmenuInfo = Partial<ContextmenuType>;
export const SET_CONTEXTMENU_INFO = 'contextmenuInfo/SET_CONTEXTMENU_INFO' as const;
export const setContextmenuInfo = (params: SetContextmenuInfo) => ({
  type: SET_CONTEXTMENU_INFO,
  payload: params,
});
