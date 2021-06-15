import _ from 'lodash';
import { RenderingDataAction } from 'actions/renderingData';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

interface RenderingDataState {
  // 기존 renderingData
  axis: 'y' | 'z';
  isBoneOn: boolean;
  isMeshOn: boolean;
  isShadowOn: boolean;
  position: Transform.Normal;
  quaternion: Transform.Quaternion;
  rotation: Transform.Normal;
  scale: Transform.Normal;
  // Three 내부 요소
  currentBone: THREE.Bone | null;
  scene: THREE.Scene | null;
  directionalLight: THREE.DirectionalLight | null;
  skeletonHelper: THREE.SkeletonHelper | null;
  cameraControls: OrbitControls | null;
  transformControls: TransformControls | null;
}

const defaultState: RenderingDataState = {
  axis: 'y',
  isBoneOn: true,
  isMeshOn: true,
  isShadowOn: true,
  position: { x: 0, y: 0, z: 0 },
  quaternion: { x: 0, y: 0, z: 0, w: 1 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  currentBone: null,
  scene: null,
  directionalLight: null,
  skeletonHelper: null,
  cameraControls: null,
  transformControls: null,
};

export const renderingData = (state = defaultState, action: RenderingDataAction) => {
  switch (action.type) {
    case 'renderingData/SET_AXIS': {
      return Object.assign({}, state, {
        axis: action.payload.axis,
      });
    }
    case 'renderingData/SET_IS_BONE_ON': {
      return Object.assign({}, state, {
        isBoneOn: action.payload.isBoneOn,
      });
    }
    case 'renderingData/SET_IS_MESH_ON': {
      return Object.assign({}, state, {
        isMeshOn: action.payload.isMeshOn,
      });
    }
    case 'renderingData/SET_SHADOW_ON': {
      return Object.assign({}, state, {
        isShadowOn: action.payload.isShadowOn,
      });
    }
    case 'renderingData/SET_POSITION': {
      const { axis, value } = action.payload;
      const newPosition = _.cloneDeep(state.position);
      newPosition[axis] = value;

      return Object.assign({}, state, {
        position: newPosition,
      });
    }
    case 'renderingData/SET_QUATERNION': {
      const { axis, value } = action.payload;
      const newQuaternion = _.cloneDeep(state.quaternion);
      newQuaternion[axis] = value;

      return Object.assign({}, state, {
        quaternion: newQuaternion,
      });
    }
    case 'renderingData/SET_ROTATION': {
      const { axis, value } = action.payload;
      const newRotation = _.cloneDeep(state.rotation);
      newRotation[axis] = value;

      return Object.assign({}, state, {
        rotation: newRotation,
      });
    }
    case 'renderingData/SET_SCALE': {
      const { axis, value } = action.payload;
      const newScale = _.cloneDeep(state.scale);
      newScale[axis] = value;

      return Object.assign({}, state, {
        scale: newScale,
      });
    }
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
