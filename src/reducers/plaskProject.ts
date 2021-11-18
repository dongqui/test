import produce from 'immer';
import { PlaskProjectAction } from 'actions/plaskProjectAction';
import { PlaskProject } from 'types/common';
import { v4 as uuidv4 } from 'uuid';

type State = PlaskProject;

const defaultState: State = {
  id: uuidv4(),
  name: 'New Project',
  sceneList: [],
  assetList: [],
  visualizedAssetIds: [],
  fps: 30,
};

export const plaskProject = (state = defaultState, action: PlaskProjectAction) => {
  switch (action.type) {
    case 'plaskProject/ADD_SCENE': {
      return Object.assign({}, state, {
        sceneList: [...state.sceneList, action.payload.scene],
      });
    }
    case 'plaskProject/REMOVE_SCENE': {
      return Object.assign({}, state, {
        sceneList: state.sceneList.filter((scene) => scene.id !== action.payload.sceneId),
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
    case 'plaskProject/ADD_MOTION': {
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
