import * as BABYLON from '@babylonjs/core';
import { SelectedTargetsAction } from 'actions/selectedTargetsAction';
import _ from 'lodash';

type State = Array<BABYLON.Mesh | BABYLON.TransformNode>;

const defaultState: State = [];

// saga를 사용한 리팩토링은 추후에 진행할 계획입니다.
export const selectedTargets = (state = defaultState, action: SelectedTargetsAction) => {
  switch (action.type) {
    case 'selectedTargetsAction/DEFAULT_SINGLE_SELECT': {
      if (state.length === 1 && state[0] === action.payload.target) {
        return state;
      } else {
        return [action.payload.target];
      }
    }
    case 'selectedTargetsAction/DEFAULT_MULTI_SELECT': {
      return [...action.payload.targets];
    }
    case 'selectedTargetsAction/CTRL_KEY_SINGLE_SELECT': {
      if (state.find((target) => target.id === action.payload.target.id)) {
        return state.filter((target) => target.id !== action.payload.target.id);
      } else {
        return [...state, action.payload.target];
      }
    }
    case 'selectedTargetsAction/CTRL_KEY_MULTI_SELECT': {
      return _.xorBy(state, action.payload.targets, 'id');
    }
    case 'selectedTargetsAction/RESET_SELECTED_TARGETS': {
      return defaultState;
    }
    default: {
      return state;
    }
  }
};
