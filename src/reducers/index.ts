import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { lpNode } from './LP/lpNode';
import { shootProject } from './shootProject';
import { selectingData } from './selectingData';
import { animationData } from './animationData';
import { animatingControls } from './animatingControls';
import trackList from './trackList';
import keyframes from './keyframes';
import { modeSelection } from './modeSelection';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  lpNode,
  shootProject,
  selectingData,
  animationData,
  animatingControls,
  trackList,
  keyframes,
  modeSelection,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
