import { PlaskEngine } from '3d/PlaskEngine';
import { Middleware } from 'redux';

import { PlaskCommand } from 'types/common';
import * as plaskHistoryAction from 'actions/plaskHistoryAction';
import { dispatch, pointer } from 'd3';
import * as animationDataActions from 'actions/animationDataAction';
import * as keyframeActions from 'actions/keyframes';
import { cloneDeep } from 'lodash';

const filterType = (type: string) => {
  const primary = type.split('/')[0];
  const secondary = type.split('/')[1];
  switch (primary) {
    case 'plaskHistory':
      switch (secondary) {
        case 'UNDO':
          return 'Undo';
        case 'REDO':
          return 'redo';
      }
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

    // case 'trackList':
    //   switch (secondary) {
    //     case 'CHANGE_SELECTED_TARGETS':
    //       return 'Select';
    //   }
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
  let previousPointer: number = plaskHistory.previousPointer;

  let history: Array<PlaskCommand> = plaskHistory.history;

  const { promise, type, api, ...rest } = action;
  switch (type) {
    case 'plaskHistory/UNDO':
      next(action);
      if (plaskHistory.pointer > -1) {
        currentPointer = plaskHistory.pointer - 1;
      }
      if (history.length > 0 && plaskHistory.pointer > -1) {
        store.dispatch({
          type: `${history[plaskHistory.pointer].action.type.split('/')[0]}/OVERRIDE`,
          payload: plaskHistory.history[plaskHistory.pointer].state.past[history[plaskHistory.pointer].action.type.split('/')[0].split('Action')[0]],
        });

        if (history[plaskHistory.pointer].title === 'Add Keyframe' || history[plaskHistory.pointer].title === 'Delete Keyframe') {
          store.dispatch(plaskHistoryAction.updateServer());
        }
        store.dispatch(plaskHistoryAction.updated());
      }
      return;
    case 'plaskHistory/REDO':
      next(action);

      if (plaskHistory.pointer < history.length - 1) {
        currentPointer = plaskHistory.pointer + 1;
      }
      if (history.length > 0 && currentPointer < history.length) {
        store.dispatch({
          type: `${history[currentPointer].action.type.split('/')[0]}/OVERRIDE`,
          payload: plaskHistory.history[currentPointer].state.present[history[currentPointer].action.type.split('/')[0].split('Action')[0]],
        });

        if (history[currentPointer].title === 'Add Keyframe' || history[currentPointer].title === 'Delete Keyframe') {
          store.dispatch(plaskHistoryAction.updateServer());
        }
        store.dispatch(plaskHistoryAction.updated());
      }
      return;

    case 'plaskHistory/UPDATED':
      next(action);

      if (plaskHistory.pointer > -1) {
        const updatedCommand = history[currentPointer];
        const pastCommand = history[currentPointer + 1];
        const updatedAction = updatedCommand.action;
        const updatedState = previousState;
        updatedCommand.setPresent(updatedState);
        if (pastCommand) {
          pastCommand.setFuture(updatedState);
        }
      }
      return;

    default:
      next(action);
      const commandName = filterType(type);

      if (commandName) {
        store.dispatch(plaskHistoryAction.addHistory({ command: new PlaskCommand(action, previousState, commandName) }));
        store.dispatch(plaskHistoryAction.updated());
      }
  }
};
