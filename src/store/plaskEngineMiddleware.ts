import { PlaskEngine } from '3d/PlaskEngine';
import { Middleware } from 'redux';

export const plaskStateSync: Middleware = (store) => (next) => (action) => {
  const previousState = store.getState();
  const result = next(action);
  if (action.type === 'selectingDataAction/ADD_ENTITIES' || action.type === 'selectingDataAction/REMOVE_ENTITIES' || action.type.startsWith('@@redux-undo')) {
    PlaskEngine.GetInstance()?.onEntitiesChanged(store.getState().selectingData.present.allEntitiesMap, previousState.selectingData.present.allEntitiesMap);
  } else {
    PlaskEngine.GetInstance()?.onStateChanged(action, store.getState(), previousState);
  }
  return result;
};
