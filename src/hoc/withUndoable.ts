import { Reducer } from 'redux';
import _ from 'lodash';
import * as withUndoableActions from 'actions/withUndoable';
import * as boneTransformActions from 'actions/boneTransform';

interface State {
  past: Reducer[];
  present: Reducer;
  future: Reducer[];
}

interface InitialAction {
  type: undefined;
  payload: undefined;
}

type Action =
  | InitialAction
  | withUndoableActions.WithUndoableAction
  | boneTransformActions.BoneTransformAction;

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
    present: reducer(undefined, { type: undefined, payload: undefined }), // 빈 type 사용해서 initial reducer 생성
    future: [],
  };

  // undo, redo 가능한 reducer를 반환
  return function (state: State = initialState, incomingAction: any) {
    const { past, present, future } = state;
    const action = incomingAction as Action;

    switch (action.type) {
      case 'UNDO': {
        if (past.length === 0) {
          return state;
        }
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        // present 와 previous 의 currentBone 이 다르고, newPast 가 빈 배열이 아닐 때 한번 더 호출하는 것과 같은 로직
        if (present.bone !== previous.bone && newPast.length !== 0) {
          const newPrevious = newPast[newPast.length - 1];
          return {
            past: newPast.slice(0, newPast.length - 1),
            present: newPrevious,
            future: [previous, present, ...future],
          };
        }
        return {
          past: newPast,
          present: previous,
          future: [present, ...future],
        };
      }
      case 'REDO': {
        if (future.length === 0) {
          return state;
        }
        const next = future[0];
        const newFuture = future.slice(1);
        // present 와 next 의 currentBone 이 다르고, newFuture 가 빈 배열이 아닐 때 한번 더 호출하는 것과 같은 로직
        if (present.bone !== next.bone && newFuture.length !== 0) {
          const newNext = newFuture[0];
          return {
            past: [...past, present, next],
            present: newNext,
            future: newFuture.slice(1),
          };
        }
        return {
          past: [...past, present],
          present: next,
          future: newFuture,
        };
      }
      case 'RESET_HISTORY': {
        return initialState;
      }
      default: {
        const newPresent = reducer(present, action);
        if (_.isEqual(present, newPresent)) {
          return state;
        }
        if (Object.values(present).includes(null)) {
          return {
            past: [...past],
            present: newPresent,
            future: [],
          };
        }
        return {
          past: [...past, present],
          present: newPresent,
          future: [],
        };
      }
    }
  };
};

export default withUndoable;
