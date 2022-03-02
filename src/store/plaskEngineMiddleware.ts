import { PlaskState } from '3d/PlaskState';
import { Middleware } from 'redux';

export const plaskStateSync: Middleware = (store) => (next) => (action) => {
  let result = next(action);
  PlaskState.action(action, store.getState());
  return result;
};
