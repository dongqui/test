import { PlaskEngine } from '3d/PlaskEngine';
import { Middleware } from 'redux';

import { PlaskCommand } from 'types/common';
import * as plaskHistoryAction from 'actions/plaskHistoryAction';
import { dispatch } from 'd3';
import * as animationDataActions from 'actions/animationDataAction';

const filterType = (type: string) => {
  const primary = type.split('/')[0];
  const secondary = type.split('/')[1];
  switch (primary) {
    case 'keyframes':
      switch (secondary) {
        case 'ADD_KEYFRAMES':
          return 'Add Keyframe';
        case 'DELETE_KEYFRAMES':
          return 'Delete Keyframe';
        case 'SELECT_KEYFRAMES':
          return 'Keyframe Select';
        case 'SELECT_KEYFRAMES_BY_DRAG_BOX':
          return 'Multi keyframes select';
        case 'DRAG_DROP_KEYFRAMES':
          return 'Move keyframe';
      }
      break;
    case 'selectingDataAction':
      switch (secondary) {
        case 'DEFAULT_MULTI_SELECT':
          return 'Select';
        case 'CTRL_KEY_MULTI_SELECT':
          return 'Add Select';
        case 'SELECT_ALL_SELECTABLE_OBJECTS':
          return 'Select all';
        case 'RESET_SELECTED_TARGETS':
          return 'Select reset';
        case 'EDIT_ENTITIES':
          return 'Object edit';
      }

      break;
  }
  return false;
};

export const plaskHistory: Middleware = (store) => (next) => (action) => {
  const previousState = store.getState();
  const plaskHistory = store.getState().plaskHistory;

  let currentPointer: number = plaskHistory.pointer;

  const { promise, type, api, ...rest } = action;
  console.log(action);
  console.log('=====');
  switch (type) {
    case 'plaskHistory/UNDO':
      next(action);
      if (plaskHistory.pointer > -1) {
        currentPointer = plaskHistory.pointer - 1;
      }

      if (plaskHistory.history.length > 0) {
        store.dispatch({ type: `${plaskHistory.history[currentPointer + 1].action.type.split('/')[0]}/OVERRIDE`, payload: plaskHistory.history[currentPointer + 1].state.past });
        store.dispatch(plaskHistoryAction.updated());
      }
      return;
    case 'plaskHistory/REDO':
      next(action);
      if (plaskHistory.pointer < plaskHistory.history.length - 1) {
        currentPointer = plaskHistory.pointer + 1;
      }

      if (plaskHistory.history.length > 0 && currentPointer < plaskHistory.history.length) {
        store.dispatch({ type: `${plaskHistory.history[currentPointer].action.type.split('/')[0]}/OVERRIDE`, payload: plaskHistory.history[currentPointer].state.present });
        store.dispatch(plaskHistoryAction.updated());
      }
      return;

    case 'plaskHistory/UPDATED':
      next(action);

      console.log('=== HISTORY UPDATED ===');
      if (plaskHistory.pointer > -1) {
        const updatedCommand = plaskHistory.history[plaskHistory.pointer];
        const updatedAction = updatedCommand.action;
        const updatedState = previousState[updatedAction.type.split('/')[0].split('Action')[0]];
        updatedCommand.setPresent(updatedState);
        store.dispatch(animationDataActions.editAnimationIngredient({ animationIngredient: previousState['animationData'].animationIngredients[0] }));
      }
      return;

    default:
      next(action);
      const commandName = filterType(type);
      if (commandName) {
        store.dispatch(plaskHistoryAction.addHistory({ command: new PlaskCommand(action, previousState[type.split('/')[0].split('Action')[0]], commandName) }));
        store.dispatch(plaskHistoryAction.updated());
      }
  }
};
