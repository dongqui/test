import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { mode } from './mode';
import { lpMode } from './lpMode';
import { lpPage } from './lpPage';
import { lpSearchword } from './lpSearchword';
import { lpData } from './lpData';
import { undoableBoneTransform } from './boneTransform';
import { undoableBoneTransform } from './boneTransform';
import { animatingData } from './animatingData';
import { renderingData } from './renderingData';
import { currentVisualizedData } from './currentVisualizedData';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  undoableBoneTransform,
  lpMode,
  lpPage,
  lpSearchword,
  lpData,
  animatingData,
  renderingData,
  currentVisualizedData,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
