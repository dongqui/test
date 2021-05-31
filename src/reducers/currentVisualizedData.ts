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
      const { resultTracks } = action.payload;
      if (resultTracks.length === 0) {
        return state;
      }
      const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
        console.log('draft: ', draft);
        if (draft) {
          resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
            draft.baseLayer[targetTrackIndex] = resultTrack;
          });
        }
      });
      return nextState;
    }
    case 'currentVisualizedData/UPDATE_KEYFRAME_TO_LAYER': {
      const { targetLayerIndex, resultTracks } = action.payload;
      if (resultTracks.length === 0) {
        return state;
      }
      const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
        if (draft) {
          resultTracks.forEach(([resultTrack, targetTrackIndex]) => {
            draft.layers[targetLayerIndex].tracks[targetTrackIndex] = resultTrack;
          });
        }
      });
      return nextState;
    }
    case 'currentVisualizedData/DELETE_KEYFRAME': {
      const { resultBaseLayerTracks, resultLayersTracks } = action.payload;
      if (resultBaseLayerTracks.length === 0 && resultLayersTracks.length === 0) {
        return state;
      }
      const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
        if (draft) {
          resultBaseLayerTracks.forEach(([resultTrack, targetTrackIndex]) => {
            draft.baseLayer[targetTrackIndex] = resultTrack;
          });
          resultLayersTracks.forEach(([resultTrack, targetLayerIndex, targetTrackIndex]) => {
            draft.layers[targetLayerIndex].tracks[targetTrackIndex] = resultTrack;
          });
        }
      });
      return nextState;
    }
    case 'currentVisualizedData/EXCLUDE_TRACK': {
      const { targetTrack, updatedState } = action.payload;
      if (targetTrack) {
        if (targetTrack.layerKey === 'baseLayer') {
          const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
            if (draft) {
              _.forEach(updatedState, (updated) => {
                const transformIndex = _.findIndex(
                  draft.baseLayer,
                  (currentVisualizedData) => currentVisualizedData.name === updated.name,
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
              const targetLayer = _.find(
                draft.layers,
                (layer) => layer.key === targetTrack.layerKey,
              );
              if (targetLayer) {
                _.forEach(updatedState, (updated) => {
                  const transformIndex = _.findIndex(
                    targetLayer.tracks,
                    (currentVisualizedData) => currentVisualizedData.name === updated.name,
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
      return state;
    }
    case 'currentVisualizedData/SET_LAYER_NAME': {
      const { targetTrack, newLayerName } = action.payload;
      if (targetTrack) {
        const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
          if (draft) {
            const targetLayer = _.find(draft.layers, (layer) => layer.key === targetTrack.layerKey);
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
      const { targetTrack } = action.payload;
      if (targetTrack) {
        const nextState = produce<CurrentVisualizedDataState>(state, (draft) => {
          if (draft) {
            draft.layers = _.filter(draft.layers, (layer) => layer.key !== targetTrack.layerKey);
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
