import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { mode } from './mode';
import { lpMode } from './lpMode';
import { lpPage } from './lpPage';
import { lpSearchword } from './lpSearchword';
import { lpData } from './lpData';
import { undoableBoneTransform } from './boneTransform';
import { animatingData } from './animatingData';
import { renderingData } from './renderingData';
import { retargetData } from './retargetData';
import { currentVisualizedData } from './currentVisualizedData';
import { timeline } from './timeline';
import { cpData } from './cpData';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  undoableBoneTransform,
  timeline,
  lpMode,
  lpPage,
  lpSearchword,
  lpData,
  animatingData,
  renderingData,
  retargetData,
  currentVisualizedData,
  cpData,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
