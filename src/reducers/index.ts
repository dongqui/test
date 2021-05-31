import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { mode } from './mode';
import { lpMode } from './lpMode';
import { lpPage } from './lpPage';
import { lpSearchword } from './lpSearchword';
import { lpData } from './lpData';
import { undoableBoneTransform } from './boneTransform';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  mode,
  undoableBoneTransform,
  lpMode,
  lpPage,
  lpSearchword,
  lpData,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
