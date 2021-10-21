import produce from 'immer';
import { ShootProjectAction } from 'actions/shootProjectAction';
import { ShootProject } from 'types/common';
import { v4 as uuidv4 } from 'uuid';

type State = ShootProject;

const defaultState: State = {
  id: uuidv4(),
  sceneList: [],
  assetList: [],
  visualizedAssetIds: [],
  fileToLoad: null,
  assetIdToRender: null,
  assetIdToUnrender: null,
  assetToRemove: null,
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
    case 'shootProject/CHANGE_FILE_TO_LOAD': {
      return Object.assign({}, state, {
        fileToLoad: action.payload.file,
      });
    }
    case 'shootProject/ADD_ASSET': {
      return Object.assign({}, state, {
        assetList: [...state.assetList, action.payload.asset],
      });
    }
    case 'shootProject/RENDER_ASSET': {
      if (state.visualizedAssetIds.length === 1) {
        return Object.assign({}, state, {
          assetIdToRender: action.payload.assetId,
          assetIdToUnrender: state.visualizedAssetIds[0],
          visualizedAssetIds: [action.payload.assetId], // 다중모델 로드 가능한 버전에서는 push로 변경 필요
        });
      } else {
        return Object.assign({}, state, {
          assetIdToRender: action.payload.assetId,
          assetIdToUnrender: null,
          visualizedAssetIds: [action.payload.assetId], // 다중모델 로드 가능한 버전에서는 push로 변경 필요
        });
      }
    }
    case 'shootProject/UNRENDER_ASSET': {
      return Object.assign({}, state, {
        assetIdToRender: null,
        assetIdToUnrender: action.payload.assetId,
        visualizedAssetIds: [], // 다중모델 로드 가능한 버전에서는 filter로 변경 필요
      });
    }
    case 'shootProject/REMOVE_ASSET': {
      return Object.assign({}, state, {
        assetIdToRender: null,
        assetIdToUnrender: action.payload.assetId,
        assetToRemove: state.assetList.find((asset) => asset.id === action.payload.assetId),
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
