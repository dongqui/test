import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { undoableBoneTransform } from './boneTransform';
import { animatingData } from './animatingData';
import { renderingData } from './renderingData';
import { currentVisualizedData } from './currentVisualizedData';
import { timeline } from './timeline';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  undoableBoneTransform,
  timeline,
  animatingData,
  renderingData,
  currentVisualizedData,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
