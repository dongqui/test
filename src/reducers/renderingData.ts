import { RenderingDataAction, SET_SKELETON_HELPER } from 'actions/renderingData';

interface RenderingDataState {}

const defaultState: RenderingDataState = {};

export const renderingData = (state = defaultState, action: RenderingDataAction) => {
  switch (action.type) {
    case 'renderingData/SET_SKELETON_HELPER': {
      return Object.assign({}, state, {});
    }
  }
};
