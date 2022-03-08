import { PlaskEngine } from '3d/PlaskEngine';
import { Middleware } from 'redux';

export const plaskStateSync: Middleware = (store) => (next) => (action) => {
  const previousState = store.getState();
  const result = next(action);
  PlaskEngine.GetInstance()?.onStateChanged(action, store.getState(), previousState);
  return result;
};
