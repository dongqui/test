import { combineReducers } from 'redux';
import { mode } from './mode';
import { undoableBoneTransform } from './boneTransform';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  mode,
  undoableBoneTransform,
});

export default rootReducer;
