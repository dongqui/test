import * as BABYLON from '@babylonjs/core';
import { AnimationDataAction } from 'actions/animationDataAction';
import { AnimationIngredient, PlaskRetargetMap } from 'types/common';

type State = {
  animationTransformNodes: BABYLON.TransformNode[];
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
              id: anim.id,
              name: anim.name,
              assetId: anim.assetId,
              current: false,
              tracks: anim.tracks,
              layer: anim.layers,
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
      // 단일 추가와는 달리 current에 대한 핸들링 해주지 않음 -> action 호출 시 인자로 넘겨주는 animationIngredients들의 current를 그대로 사용
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
              tracks: animaitonIngredient.tracks.map((track) => (track.layerId === action.payload.layerId ? { ...track, isIncluded: !track.isIncluded } : track)),
            };
          } else {
            return animaitonIngredient;
          }
        }),
      });
    }
    case 'animationDataAction/ASSIGN_BONE_MAPPING': {
      return Object.assign({}, state, {
        retargetMaps: state.retargetMaps.map((retargetMap) => {
          if (retargetMap.assetId === action.payload.assetId) {
            return {
              ...retargetMap,
              values: retargetMap.values.map((retargetMapValue) => {
                if (retargetMapValue.sourceBoneName === action.payload.sourceBoneName) {
                  return { ...retargetMapValue, targetTransformNodeId: action.payload.targetTransformNodeId };
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
