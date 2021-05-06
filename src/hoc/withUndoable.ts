/* eslint-disable no-case-declarations */
import { Reducer } from 'redux';

/**
 * reducer를 감싸는 고차함수로, 대상 reducer의 history 관리가 가능하도록 만들어줍니다.
 *
 * @param reducer - undo를 사용할 수 있도록 감쌀 대상 reducer
 *
 * @returns history 관리가 가능한 reducer
 */
const withUndoable = (reducer: Reducer<any, any>) => {
  const initialState = {
    past: [],
    present: reducer(undefined, {}), // 빈 type 사용해서 initial reducer 생성
    future: [],
  };

  // undo, redo 가능한 reducer를 반환
  return function (
    state: { past: Reducer[]; present: Reducer; future: Reducer[] } = initialState,
    action: { type: string; payload?: any },
  ) {
    const { past, present, future } = state;

    switch (action.type) {
      case 'UNDO':
        if (past.length === 0) {
          return state;
        }
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return {
          past: newPast,
          present: previous,
          future: [present, ...future],
        };
      case 'REDO':
        if (future.length === 0) {
          return state;
        }
        const next = future[0];
        const newFuture = future.slice(1);
        return {
          past: [...past, present],
          present: next,
          future: newFuture,
        };
      default:
        const newPresent = reducer(present, action);
        if (present === newPresent) {
          return state;
        }
        if (Object.values(present).includes(undefined)) {
          return {
            past: [...past],
            present: newPresent,
            future: [...future],
          };
        }
        return {
          past: [...past, present],
          present: newPresent,
          future: [...future],
        };
    }
  };
};

export default withUndoable;
