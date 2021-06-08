import { CutImagesAction } from 'actions/cutImages';
import { CutImagesType } from 'types/VM';

type CutImagesState = CutImagesType;

const defaultState: CutImagesState = {
  urls: [],
};

export const cutImages = (state = defaultState, action: CutImagesAction) => {
  switch (action.type) {
    case 'cutImages/SET_CUTIMAGES': {
      return Object.assign({}, state, {
        urls: action.payload.urls,
      });
    }
    default: {
      return state;
    }
  }
};
