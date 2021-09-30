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
  assetIdToAdd: null,
  assetIdToRemove: null,
  fps: 30,
};

export const shootProject = (state = defaultState, action: ShootProjectAction) => {
  switch (action.type) {
    case 'shootProject/ADD_SCENE': {
      if (!state.sceneList.find((scene) => scene.id === action.payload.scene.id)) {
        return Object.assign({}, state, {
          sceneList: [...state.sceneList, action.payload.scene],
        });
      } else {
        return state;
      }
    }
    case 'shootProject/CHANGE_FILE_TO_LOAD': {
      if (state.fileToLoad !== action.payload.file) {
        return Object.assign({}, state, {
          fileToLoad: action.payload.file,
        });
      } else {
        return state;
      }
    }
    case 'shootProject/ADD_ASSET': {
      if (!state.assetList.find((asset) => asset.id === action.payload.asset.id)) {
        return Object.assign({}, state, {
          assetList: [...state.assetList, action.payload.asset],
        });
      } else {
        return state;
      }
    }
    default: {
      return state;
    }
  }
};
