import { combineReducers } from 'redux';
import { TypedUseSelectorHook, useSelector as useReduxSelector } from 'react-redux';
// Old
import { lpMode } from './lpMode';
import { lpPage } from './lpPage';
import { lpSearchword } from './lpSearchword';
import { lpData, lpDataOld } from './lpData';
import { undoableBoneTransform } from './boneTransform';
import { animatingData } from './animatingData';
import { renderingData } from './renderingData';
import { retargetData } from './retargetData';
import { currentVisualizedData } from './currentVisualizedData';
import { timeline } from './timeline';
import { cpData } from './cpData';
import { lpPageOld } from './lpPage';
import { pageInfo } from './pageInfo';
import { recordingData } from './recordingData';
import { cutImages } from './cutImages';
import { barPositionX } from './barPositionX';
import { modalInfo } from './modalInfo';
import { contextmenuInfo } from './contextmenuInfo';
// New
import { lpNode } from './LP/lpNode';
import { shootProject } from './shootProject';
import { selectingData } from './selectingData';
import { animationIngredients } from './animationIngredients';

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
  lpDataOld,
  lpPageOld,
  pageInfo,
  recordingData,
  cutImages,
  barPositionX,
  modalInfo,
  contextmenuInfo,
  // New
  lpNode,
  shootProject,
  selectingData,
  animationIngredients,
});

// type 적용된 useSelector
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default rootReducer;
