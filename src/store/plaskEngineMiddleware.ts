import { PlaskEngine } from '3d/PlaskEngine';
import { Middleware } from 'redux';

export const plaskStateSync: Middleware = (store) => (next) => (action) => {
  const previousState = store.getState();
  const result = next(action);
  if (action.type === 'selectingDataAction/ADD_ENTITIES' || action.type === 'selectingDataAction/REMOVE_ENTITIES' || action.type === 'selectingDataAction/OVERRIDE') {
    PlaskEngine.GetInstance()?.onEntitiesChanged(store.getState().selectingData.allEntitiesMap, previousState.selectingData.allEntitiesMap);
  }
  PlaskEngine.GetInstance()?.onStateChanged(action, store.getState(), previousState);

  return result;
};
