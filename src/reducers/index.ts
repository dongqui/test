import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { lpNode } from './LP/lpNode';
import { plaskProject } from './plaskProject';
import { selectingData } from './selectingData';
import { animationData } from './animationData';
import { animatingControls } from './animatingControls';
import { modeSelection } from './modeSelection';
import { keyframes } from './keyframes';
import { trackList } from './trackList';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  lpNode,
  plaskProject,
  selectingData,
  animationData,
  animatingControls,
  modeSelection,
  keyframes,
  trackList,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
