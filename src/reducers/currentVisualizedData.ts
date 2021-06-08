import { CurrentVisualizedData, CurrentVisualizedDataAction } from 'actions/currentVisualizedData';
import produce from 'immer';
import _ from 'lodash';

type CurrentVisualizedDataState = CurrentVisualizedData | null;

const defaultState: CurrentVisualizedDataState = null;

export const currentVisualizedData = (
  state = defaultState,
  action: CurrentVisualizedDataAction,
) => {
  switch (action.type) {
    case 'currentVisualizedData/RESET_CURRENT_VISUALIZED_DATA': {
      return defaultState;
    }
    case 'currentVisualizedData/SET_CURRENT_VISUALIZED_DATA': {
      return Object.assign({}, state, {
        key: action.payload.data.key,
        name: action.payload.data.name,
        type: action.payload.data.type,
        boneNames: action.payload.data.boneNames,
        baseLayer: action.payload.data.baseLayer,
        layers: action.payload.data.layers,
      });
    }
    case 'currentVisualizedData/UPDATE_KEYFRAME_TO_BASE': {
      return action.payload.data; // action을 보낼 때 data에 CurrentVisualizedData가 담긴 채로 전달
    }
    case 'currentVisualizedData/UPDATE_KEYFRAME_TO_LAYER': {
      return action.payload.data; // action을 보낼 때 data에 CurrentVisualizedData가 담긴 채로 전달
    }
    case 'currentVisualizedData/DELETE_KEYFRAME': {
      return action.payload.data; // action을 보낼 때 data에 CurrentVisualizedData가 담긴 채로 전달
    }
    case 'currentVisualizedData/EXCLUDE_TRACK': {
      const { layerKey, updatedState } = action.payload;
      if (layerKey === 'baseLayer') {
        const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
          if (draft) {
            _.forEach(updatedState, (updated) => {
              const transformIndex = _.findIndex(
                draft.baseLayer,
                (currentVisualizedData) => currentVisualizedData.name === updated.trackName,
              );
              if (transformIndex !== -1) {
                draft.baseLayer[transformIndex].isIncluded = updated.isIncluded;
              }
            });
          }
        });
        return nextState;
      } else {
        const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
          if (draft) {
            const targetLayer = _.find(draft.layers, (layer) => layer.key === layerKey);
            if (targetLayer) {
              _.forEach(updatedState, (updated) => {
                const transformIndex = _.findIndex(
                  targetLayer.tracks,
                  (currentVisualizedData) => currentVisualizedData.name === updated.trackName,
                );
                if (transformIndex !== -1) {
                  targetLayer.tracks[transformIndex].isIncluded = updated.isIncluded;
                }
              });
            }
          }
        });
        return nextState;
      }
    }
    case 'currentVisualizedData/SET_LAYER_NAME': {
      const { layerKey, newLayerName } = action.payload;
      if (layerKey) {
        const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
          if (draft) {
            const targetLayer = _.find(draft.layers, (layer) => layer.key === layerKey);
            if (targetLayer) {
              targetLayer.name = newLayerName;
            }
          }
        });
        return nextState;
      }
      return state;
    }
    case 'currentVisualizedData/ADD_NEW_LAYER': {
      const { newLayer } = action.payload;
      const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
        if (draft) {
          draft.layers.push(newLayer);
        }
      });
      return nextState;
    }
    case 'currentVisualizedData/DELETE_LAYER': {
      const { layerKey } = action.payload;
      if (layerKey) {
        const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
          if (draft) {
            draft.layers = _.filter(draft.layers, (layer) => layer.key !== layerKey);
          }
        });
        return nextState;
      }
      return state;
    }
    default: {
      return state;
    }
  }
};
