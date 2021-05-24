import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { mode } from './mode';
import { lpmode } from './lpmode';
import { lppage } from './lppage';
import { lpSearchword } from './lpSearchword';
import { lpdata } from './lpdata';
import { undoableBoneTransform } from './boneTransform';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  mode,
  undoableBoneTransform,
  lpmode,
  lppage,
  lpSearchword,
  lpdata,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
