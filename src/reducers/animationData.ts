import { AnimationDataAction } from 'actions/animationDataAction';
import { RETARGET_TARGET_BONE_NONE } from 'utils/const';
import { AnimationIngredient, PlaskRetargetMap } from 'types/common';
import { TransformNode } from '@babylonjs/core';

type State = {
  animationTransformNodes: TransformNode[];
  animationIngredients: AnimationIngredient[];
  retargetMaps: PlaskRetargetMap[];
};

const defaultState: State = {
  animationTransformNodes: [],
  animationIngredients: [],
  retargetMaps: [],
};

export const animationData = (state = defaultState, action: AnimationDataAction) => {
  switch (action.type) {
    case 'animationDataAction/ADD_ASSET': {
      return Object.assign({}, state, {
        animationTransformNodes: [...state.animationTransformNodes, ...action.payload.transformNodes],
        animationIngredients: [...state.animationIngredients, ...action.payload.animationIngredients],
        retargetMaps: [...state.retargetMaps, action.payload.retargetMap],
      });
    }
    case 'animationDataAction/REMOVE_ASSET': {
      return Object.assign({}, state, {
        animationTransformNodes: state.animationTransformNodes.filter((transformNode) => !transformNode.id.includes(action.payload.assetId)),
        animationIngredients: state.animationIngredients.filter((anim) => anim.assetId !== action.payload.assetId),
        retargetMaps: state.retargetMaps.filter((retargetMap) => retargetMap.assetId !== action.payload.assetId),
      });
    }
    case 'animationDataAction/ADD_ANIMATION_INGREDIENT': {
      if (action.payload.animationIngredient.current) {
        return Object.assign({}, state, {
          animationIngredients: [
            ...state.animationIngredients.map((anim) => ({
              ...anim,
              current: false,
            })),
            action.payload.animationIngredient,
          ],
        });
      } else {
        return Object.assign({}, state, {
          animationIngredients: [...state.animationIngredients, action.payload.animationIngredient],
        });
      }
    }
    case 'animationDataAction/ADD_ANIMATION_INGREDIENTS': {
      // unlike case of adding single animation, we don't handle ingredients' current field
      return Object.assign({}, state, {
        animationIngredients: [...state.animationIngredients, ...action.payload.animationIngredients],
      });
    }
    case 'animationDataAction/EDIT_ANIMATION_INGREDIENT': {
      return Object.assign({}, state, {
        animationIngredients: state.animationIngredients.map((anim) => (anim.id === action.payload.animationIngredient.id ? action.payload.animationIngredient : anim)),
      });
    }
    case 'animationDataAction/EDIT_ANIMATION_INGREDIENTS': {
      return Object.assign({}, state, {
        animationIngredients: action.payload.animationIngredients,
      });
    }
    case 'animationDataAction/CHANGE_CURRENT_ANIMATION_INGREDIENT': {
      return Object.assign({}, state, {
        animationIngredients: state.animationIngredients.map((animationIngredient) => {
          if (animationIngredient.assetId === action.payload.assetId) {
            if (animationIngredient.id === action.payload.animationIngredientId) {
              return { ...animationIngredient, current: true };
            } else {
              return { ...animationIngredient, current: false };
            }
          } else {
            return animationIngredient;
          }
        }),
      });
    }
    case 'animationDataAction/REMOVE_ANIMATION_INGREDIENT': {
      return Object.assign({}, state, {
        animationIngredients: state.animationIngredients.filter((anim) => anim.id !== action.payload.animationIngredientId),
      });
    }
    case 'animationDataAction/TOGGLE_LAYER_MUTENESS': {
      return Object.assign({}, state, {
        animationIngredients: state.animationIngredients.map((animaitonIngredient) => {
          if (animaitonIngredient.id === action.payload.animationIngredientId) {
            return {
              ...animaitonIngredient,
              layers: animaitonIngredient.layers.map((layer) => (layer.id === action.payload.layerId ? { ...layer, isIncluded: !layer.isIncluded } : layer)),
            };
          } else {
            return animaitonIngredient;
          }
        }),
      });
    }
    case 'animationDataAction/TURN_FILTER_ON': {
      return Object.assign({}, state, {
        animationIngredients: state.animationIngredients.map((animationIngredient) => {
          if (animationIngredient.id === action.payload.animationIngredientId) {
            return {
              ...animationIngredient,
              layers: animationIngredient.layers.map((layer) => (layer.id === action.payload.layerId ? { ...layer, useFilter: true } : layer)),
            };
          } else {
            return animationIngredient;
          }
        }),
      });
    }
    case 'animationDataAction/TURN_FILTER_OFF': {
      return Object.assign({}, state, {
        animationIngredients: state.animationIngredients.map((animationIngredient) => {
          if (animationIngredient.id === action.payload.animationIngredientId) {
            return {
              ...animationIngredient,
              layers: animationIngredient.layers.map((layer) => (layer.id === action.payload.layerId ? { ...layer, useFilter: false } : layer)),
            };
          } else {
            return animationIngredient;
          }
        }),
      });
    }
    case 'animationDataAction/CHANGE_TRACK_FILTER_BETA': {
      return Object.assign({}, state, {
        animationIngredients: state.animationIngredients.map((animationIngredient) => ({
          ...animationIngredient,
          layers: animationIngredient.layers.map((layer) =>
            layer.id === action.payload.layerId
              ? { ...layer, tracks: layer.tracks.map((track) => (track.id === action.payload.trackId ? { ...track, filterBeta: action.payload.value } : track)) }
              : layer,
          ),
        })),
      });
    }
    case 'animationDataAction/CHANGE_TRACK_FILTER_MIN_CUTOFF': {
      return Object.assign({}, state, {
        animationIngredients: state.animationIngredients.map((animationIngredient) => ({
          ...animationIngredient,
          layers: animationIngredient.layers.map((layer) =>
            layer.id === action.payload.layerId
              ? { ...layer, tracks: layer.tracks.map((track) => (track.id === action.payload.trackId ? { ...track, filterMinCutoff: action.payload.value } : track)) }
              : layer,
          ),
        })),
      });
    }
    case 'animationDataAction/ASSIGN_BONE_MAPPING': {
      const { assetId, targetTransformNodeId, sourceBoneName } = action.payload;
      return Object.assign({}, state, {
        retargetMaps: state.retargetMaps.map((retargetMap) => {
          if (retargetMap.assetId === assetId) {
            return {
              ...retargetMap,
              values: retargetMap.values.map((retargetMapValue) => {
                // reset previous mapping
                if (retargetMapValue.targetTransformNodeId === targetTransformNodeId && targetTransformNodeId !== RETARGET_TARGET_BONE_NONE) {
                  return { ...retargetMapValue, targetTransformNodeId: null };
                }
                // assign new mapping
                else if (retargetMapValue.sourceBoneName === sourceBoneName) {
                  return { ...retargetMapValue, targetTransformNodeId: targetTransformNodeId };
                } else {
                  return retargetMapValue;
                }
              }),
            };
          } else {
            return retargetMap;
          }
        }),
      });
    }
    case 'animationDataAction/CHANGE_HIP_SPACE': {
      return Object.assign({}, state, {
        retargetMaps: state.retargetMaps.map((retargetMap) => {
          if (retargetMap.assetId === action.payload.assetId) {
            return { ...retargetMap, hipSpace: action.payload.hipSpaece };
          } else {
            return retargetMap;
          }
        }),
      });
    }
    default: {
      return state;
    }
  }
};
