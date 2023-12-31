import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
import { lpNode } from './LP/lpNode';
import { cpModeSelection } from './CP/cpModeSelection';
import { plaskProject } from './plaskProject';
import { selectingData } from './selectingData';
import { animationData } from './animationData';
import { screenData } from './screenData';
import { animatingControls } from './animatingControls';
import { modeSelection } from './modeSelection';
import { keyframes } from './keyframes';
import { trackList } from './trackList';
import { globalUI } from './Common/globalUI';
import { user } from './User/';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  lpNode,
  cpModeSelection,
  plaskProject,
  selectingData,
  animationData,
  screenData,
  animatingControls,
  modeSelection,
  keyframes,
  trackList,
  globalUI,
  user,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
