import { xorBy } from 'lodash';
import { SelectingData } from './../types/common';
import { SelectingDataAction } from 'actions/selectingDataAction';

type State = SelectingData;

const defaultState: State = {
  selectableObjects: [],
  selectedTargets: [],
};

// saga를 사용한 리팩토링은 추후에 진행할 계획입니다.
export const selectingData = (state = defaultState, action: SelectingDataAction) => {
  switch (action.type) {
    case 'selectingDataAction/ADD_SELECTABLE_OBJECTS': {
      return Object.assign({}, state, {
        selectableObjects: [...state.selectableObjects, ...action.payload.objects],
      });
    }
    case 'selectingDataAction/REMOVE_SELECTABLE_CONTROLLERS': {
      return Object.assign({}, state, {
        selectableObjects: state.selectableObjects.filter((object) => !(object.getClassName() === 'Mesh' && object.id.includes(action.payload.assetId))),
        selectedTargets: state.selectedTargets.filter((target) => !(target.getClassName() === 'Mesh' && target.id.includes(action.payload.assetId))),
      });
    }
    case 'selectingDataAction/REMOVE_SELECTABLE_JOINTS': {
      return Object.assign({}, state, {
        selectableObjects: state.selectableObjects.filter((object) => !(object.getClassName() === 'TransformNode' && object.id.includes(action.payload.assetId))),
        selectedTargets: state.selectedTargets.filter((target) => !(target.getClassName() === 'TransformNode' && target.id.includes(action.payload.assetId))),
      });
    }
    case 'selectingDataAction/UNRENDER_ASSET': {
      return Object.assign({}, state, {
        selectableObjects: state.selectableObjects.filter((object) => !object.id.includes(action.payload.assetId)),
        selectedTargets: state.selectedTargets.filter((target) => !target.id.includes(action.payload.assetId)),
      });
    }
    case 'selectingDataAction/DEFAULT_SINGLE_SELECT': {
      if (state.selectedTargets.length === 1 && state.selectedTargets[0] === action.payload.target) {
        return state;
      } else {
        return Object.assign({}, state, {
          selectedTargets: [action.payload.target],
        });
      }
    }
    case 'selectingDataAction/DEFAULT_MULTI_SELECT': {
      return Object.assign({}, state, {
        selectedTargets: [...action.payload.targets],
      });
    }
    case 'selectingDataAction/CTRL_KEY_SINGLE_SELECT': {
      if (state.selectedTargets.find((target) => target.id === action.payload.target.id)) {
        return Object.assign({}, state, {
          selectedTargets: state.selectedTargets.filter((target) => target.id !== action.payload.target.id),
        });
      } else {
        return Object.assign({}, state, {
          selectedTargets: [...state.selectedTargets, action.payload.target],
        });
      }
    }
    case 'selectingDataAction/CTRL_KEY_MULTI_SELECT': {
      return Object.assign({}, state, {
        selectedTargets: xorBy(state.selectedTargets, action.payload.targets, 'id'),
      });
    }
    case 'selectingDataAction/SELECT_ALL_SELECTABLE_OBJECTS': {
      return Object.assign({}, state, {
        selectedTargets: state.selectableObjects,
      });
    }
    case 'selectingDataAction/RESET_SELECTED_TARGETS': {
      return Object.assign({}, state, {
        selectedTargets: [],
      });
    }
    default: {
      return state;
    }
  }
};
