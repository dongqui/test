import { combineReducers } from 'redux';
import { mode } from './mode';
import { undoableBoneTransform } from './boneTransform';
import { dopeSheet } from './dopeSheet';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  mode,
  undoableBoneTransform,
  dopeSheet,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
