import { PlaskAsset, PlaskScreen } from 'types/common';
import { PlaskCommand } from 'command/PlaskCommand';
export type PlaskHistoryAction = ReturnType<typeof addHistory> | ReturnType<typeof clearHistory> | ReturnType<typeof redo> | ReturnType<typeof undo> | ReturnType<typeof updated>;

const REDO = 'plaskHistory/REDO' as const;
const UNDO = 'plaskHistory/UNDO' as const;
const ADD_HISTORY = 'plaskHistory/ADD_HISTORY' as const;
const CLEAR_HISTORY = 'plaskHistory/CLEAR_HISTORY' as const;
const UPDATED = 'plaskHistory/UPDATED' as const;

interface AddHistory {
  command: PlaskCommand;
}

/**
 * 액션을 redo합니다
 *
 */
export const redo = () => ({
  type: REDO,
});

/**
 * 액션을 undo합니다
 *
 */
export const undo = () => ({
  type: UNDO,
});

/**
 * 새로운 액션을 히스토리에 추가합니다
 *
 * @param command - PlaskCommand
 */
export const addHistory = (params: AddHistory) => ({
  type: ADD_HISTORY,
  payload: {
    ...params,
  },
});

export const updated = () => ({
  type: UPDATED,
});

/**
 * 히스토리를 비웁니다
 */
export const clearHistory = () => ({
  type: CLEAR_HISTORY,
});
