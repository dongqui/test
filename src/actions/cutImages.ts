import { CutImagesType } from 'types/VM';

export type CutImagesAction = ReturnType<typeof setCutImages>;

type SetCutImages = CutImagesType;

export const SET_CUTIMAGES = 'cutImages/SET_CUTIMAGES' as const;
export const setCutImages = (params: SetCutImages) => ({
  type: SET_CUTIMAGES,
  payload: params,
});
