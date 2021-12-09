import { PlaskProjectAction } from 'actions/plaskProjectAction';
import { PlaskProject } from 'types/common';
import { getRandomStringKey } from 'utils/common';

type State = PlaskProject;

const defaultState: State = {
  id: getRandomStringKey(),
  name: 'New Project',
  screenList: [],
  assetList: [],
  visualizedAssetIds: [],
  fps: 30,
};

export const plaskProject = (state = defaultState, action: PlaskProjectAction) => {
  switch (action.type) {
    case 'plaskProject/ADD_SCREEN': {
      return Object.assign({}, state, {
        screenList: [...state.screenList, action.payload.screen],
      });
    }
    case 'plaskProject/REMOVE_SCREEN': {
      return Object.assign({}, state, {
        screenList: state.screenList.filter((screen) => screen.id !== action.payload.screenId),
      });
    }
    case 'plaskProject/ADD_ASSET': {
      return Object.assign({}, state, {
        assetList: [...state.assetList, action.payload.asset],
      });
    }
    case 'plaskProject/RENDER_ASSET': {
      return Object.assign({}, state, {
        visualizedAssetIds: [action.payload.assetId], // 다중모델 로드 가능한 버전에서는 push로 변경 필요
      });
    }
    case 'plaskProject/UNRENDER_ASSET': {
      return Object.assign({}, state, {
        visualizedAssetIds: [], // 다중모델 로드 가능한 버전에서는 filter로 변경 필요
      });
    }
    case 'plaskProject/REMOVE_ASSET': {
      return Object.assign({}, state, {
        assetList: state.assetList.filter((asset) => asset.id !== action.payload.assetId),
        visualizedAssetIds: state.visualizedAssetIds.filter((id) => id !== action.payload.assetId),
      });
    }
    case 'plaskProject/ADD_ANIMATION_INGREDIENT': {
      return Object.assign({}, state, {
        assetList: state.assetList.map((asset) => {
          if (asset.id === action.payload.assetId) {
            return { ...asset, animationIngredientIds: [...asset.animationIngredientIds, action.payload.animationIngredientId] };
          } else {
            return asset;
          }
        }),
      });
    }
    default: {
      return state;
    }
  }
};
