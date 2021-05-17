import { combineReducers } from 'redux';
import { mode } from './mode';
import { undoableBoneTransform } from './boneTransform';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  mode,
  undoableBoneTransform,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
