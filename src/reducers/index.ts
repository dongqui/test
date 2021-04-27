import { combineReducers } from 'redux';
import { mode } from './mode';

export type RootState = ReturnType<typeof rootReducer>;

const rootReducer = combineReducers({
  mode,
});

export default rootReducer;
