import { xorBy } from 'lodash';
import { SelectingData } from './../types/common';
import { SelectingDataAction } from 'actions/selectingDataAction';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { combineReducers } from 'redux';
import { PlaskEntity } from '3d/entities/PlaskEntity';

type State = SelectingData;

const defaultState: State = {
  selectableObjects: [],
  selectedTargets: [],
  allEntitiesMap: {},
};

// saga를 사용한 리팩토링은 추후에 진행할 계획입니다.
export const selectingData = (state: State = defaultState, action: SelectingDataAction) => {
  switch (action.type) {
    case 'selectingDataAction/UPDATE_SELECTABLE_OBJECTS': {
      return Object.assign({}, state, {
        selectableObjects: action.payload.objects,
      });
    }
    case 'selectingDataAction/ADD_SELECTABLE_OBJECTS': {
      return Object.assign({}, state, {
        selectableObjects: state.selectableObjects.concat(action.payload.objects),
      });
    }
    case 'selectingDataAction/REMOVE_SELECTABLE_OBJECTS': {
      const entityIdsToRemove = action.payload.objects.map((entity) => entity.entityId);
      return Object.assign({}, state, {
        selectableObjects: state.selectableObjects.filter((object) => !entityIdsToRemove.includes(object.entityId)),
        selectedTargets: state.selectedTargets.filter((object) => !entityIdsToRemove.includes(object.entityId)),
      });
    }
    case 'selectingDataAction/REMOVE_SELECTABLE_CONTROLLERS': {
      return Object.assign({}, state, {
        selectableObjects: state.selectableObjects.filter((object) => !(object.type === 'controller' && object.id.includes(action.payload.assetId))),
        selectedTargets: state.selectedTargets.filter((target) => !(target.type === 'controller' && target.id.includes(action.payload.assetId))),
      });
    }
    case 'selectingDataAction/REMOVE_SELECTABLE_JOINTS': {
      return Object.assign({}, state, {
        selectableObjects: state.selectableObjects.filter((object) => !(object.type === 'joint' && object.id.includes(action.payload.assetId))),
        selectedTargets: state.selectedTargets.filter((target) => !(target.type === 'joint' && target.id.includes(action.payload.assetId))),
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

    // TODO : this should move in a special "allEntities state", that is the only source of data for babylon's scene (can be serialized to)
    case 'selectingDataAction/ADD_ENTITIES': {
      const obj = {} as { [key: string]: PlaskEntity };
      for (const entity of action.payload.targets) {
        obj[entity.entityId] = entity;
      }
      return Object.assign({}, state, { allEntitiesMap: { ...state.allEntitiesMap, ...obj } });
    }

    case 'selectingDataAction/EDIT_ENTITIES': {
      const obj = {} as { [key: string]: PlaskEntity };
      for (const entity of action.payload.targets) {
        obj[entity.entityId] = entity;
      }
      return Object.assign({}, state, { allEntitiesMap: { ...state.allEntitiesMap, ...obj } });
    }

    // TODO : this should move in a special "allEntities state", that is the only source of data for babylon's scene (can be serialized to)
    case 'selectingDataAction/REMOVE_ENTITIES': {
      const obj = {} as { [key: string]: PlaskEntity };
      const removedIds = action.payload.targets.map((entity) => entity.entityId);
      for (const entityId in state.allEntitiesMap) {
        if (!removedIds.includes(entityId)) {
          obj[entityId] = state.allEntitiesMap[entityId];
        }
      }

      return Object.assign({}, state, { allEntitiesMap: obj });
    }

    case 'selectingDataAction/OVERRIDE': {
      return Object.assign<{}, State, State>({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
