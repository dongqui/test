import { PlaskEngine } from '3d/PlaskEngine';
import { Middleware } from 'redux';

import { PlaskCommand } from 'types/common';
import * as plaskHistoryAction from 'actions/plaskHistoryAction';
import { dispatch } from 'd3';

const filterType = (type: string) => {
  const primary = type.split('/')[0];
  const secondary = type.split('/')[1];
  switch (primary) {
    case 'keyframes':
      switch (secondary) {
        case 'ADD_KEYFRAMES':
          return 'Add Keyframe';
          break;
        case 'DELETE_KEYFRAMES':
          return 'Delete Keyframe';
          break;
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
        case 'ADD_ENTITIES':
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

  switch (type) {
    case 'plaskHistory/UNDO':
      next(action);
      if (plaskHistory.pointer > -1) {
        currentPointer = plaskHistory.pointer - 1;
      }

      if (plaskHistory.history.length > 0) {
        store.dispatch({ type: `${plaskHistory.history[currentPointer + 1].action.type.split('/')[0]}/OVERRIDE`, payload: plaskHistory.history[currentPointer + 1].state.past });
      }
      return;
    case 'plaskHistory/REDO':
      next(action);
      if (plaskHistory.pointer < plaskHistory.history.length - 1) {
        currentPointer = plaskHistory.pointer + 1;
      }

      if (currentPointer < plaskHistory.history.length) {
        store.dispatch({ type: `${plaskHistory.history[currentPointer].action.type.split('/')[0]}/OVERRIDE`, payload: plaskHistory.history[currentPointer].state.present });
      }
      return;

    case 'plaskHistory/UPDATED':
      next(action);
      const updatedCommand = plaskHistory.history[plaskHistory.pointer];
      const updatedAction = updatedCommand.action;
      const updatedState = previousState[updatedAction.type.split('/')[0].split('Action')[0]];
      updatedCommand.setPresent(updatedState);
      return;

    default:
      next(action);
      const commandName = filterType(type);
      if (commandName) {
        console.log(previousState);
        store.dispatch(plaskHistoryAction.addHistory({ command: new PlaskCommand(action, previousState[type.split('/')[0].split('Action')[0]], commandName) }));
        store.dispatch(plaskHistoryAction.updated());
      }
  }
};
