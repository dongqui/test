import { ModalType } from 'types';

export type ModalInfoAction = ReturnType<typeof setModalInfo>;

type SetModalInfo = Partial<ModalType>;
export const SET_MODALINFO = 'modalInfo/SET_MODALINFO' as const;
export const setModalInfo = (params: SetModalInfo) => ({
  type: SET_MODALINFO,
  payload: params,
});
