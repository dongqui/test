import produce from 'immer';
import { ShootProjectAction } from 'actions/shootProjectAction';
import { ShootProject } from 'types/common';
import { getRandomStringKey } from 'utils/common';

type State = ShootProject;

const defaultState: State = {
  id: getRandomStringKey(),
  sceneList: [],
  assetList: [],
  visualizedAssetIds: [],
  fps: 30,
};

export const shootProject = (state = defaultState, action: ShootProjectAction) => {
  switch (action.type) {
    case 'shootProject/ADD_SCENE': {
      return Object.assign({}, state, {
        sceneList: [...state.sceneList, action.payload.scene],
      });
    }
    case 'shootProject/REMOVE_SCENE': {
      return Object.assign({}, state, {
        sceneList: state.sceneList.filter((scene) => scene.id !== action.payload.sceneId),
      });
    }
    case 'shootProject/ADD_ASSET': {
      return Object.assign({}, state, {
        assetList: [...state.assetList, action.payload.asset],
      });
    }
    case 'shootProject/RENDER_ASSET': {
      return Object.assign({}, state, {
        visualizedAssetIds: [action.payload.assetId], // 다중모델 로드 가능한 버전에서는 push로 변경 필요
      });
    }
    case 'shootProject/UNRENDER_ASSET': {
      return Object.assign({}, state, {
        visualizedAssetIds: [], // 다중모델 로드 가능한 버전에서는 filter로 변경 필요
      });
    }
    case 'shootProject/REMOVE_ASSET': {
      return Object.assign({}, state, {
        assetList: state.assetList.filter((asset) => asset.id !== action.payload.assetId),
        visualizedAssetIds: state.visualizedAssetIds.filter((id) => id !== action.payload.assetId),
      });
    }
    case 'shootProject/ADD_MOTION': {
      const nextAssetList = produce(state.assetList, (draft) => {
        const target = draft.filter((asset) => asset.id === action.payload.assetId)[0];
        target.animationIngredientIds.push(action.payload.motionId);
      });

      return Object.assign({}, state, {
        assetList: nextAssetList,
      });
    }
    default: {
      return state;
    }
  }
};
