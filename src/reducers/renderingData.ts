import { RenderingDataAction } from 'actions/renderingData';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

interface RenderingDataState {
  // 기존 renderingData 들어가야 함
  currentBone: THREE.Bone | undefined;
  scene: THREE.Scene | undefined;
  directionalLight: THREE.DirectionalLight | undefined;
  skeletonHelper: THREE.SkeletonHelper | undefined;
  cameraControls: OrbitControls | undefined;
  transformControls: TransformControls | undefined;
}

const defaultState: RenderingDataState = {
  currentBone: undefined,
  scene: undefined,
  directionalLight: undefined,
  skeletonHelper: undefined,
  cameraControls: undefined,
  transformControls: undefined,
};

export const renderingData = (state = defaultState, action: RenderingDataAction) => {
  switch (action.type) {
    case 'renderingData/SET_CURRENT_BONE': {
      return Object.assign({}, state, {
        currentBone: action.payload.bone,
      });
    }
    case 'renderingData/SET_SCENE': {
      return Object.assign({}, state, {
        scene: action.payload.scene,
      });
    }
    case 'renderingData/SET_DIRECTIONAL_LIGHT': {
      return Object.assign({}, state, {
        directionalLight: action.payload.directionalLight,
      });
    }
    case 'renderingData/SET_SKELETON_HELPER': {
      return Object.assign({}, state, {
        skeletonHelper: action.payload.skeletonHelper,
      });
    }
    case 'renderingData/SET_CAMERA_CONTROLS': {
      return Object.assign({}, state, {
        cameraControls: action.payload.cameraControls,
      });
    }
    case 'renderingData/SET_TRANSFORM_CONTROLS': {
      return Object.assign({}, state, {
        transformControls: action.payload.transformControls,
      });
    }
    default: {
      return state;
    }
  }
};
