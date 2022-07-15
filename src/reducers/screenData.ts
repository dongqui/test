import { SkeletonViewer } from '@babylonjs/core';
import { ScreenDataAction } from 'actions/screenDataAction';

interface VisibilityOption {
  screenId: string;
  isBoneVisible: boolean;
  isMeshVisible: boolean;
  isControllerVisible: boolean;
  isGridVisible: boolean;
  isShadowVisible: boolean;
  isGizmoVisible: boolean;
  isIKControllerVisible: boolean;
}

interface PlaskSkeletonViewer {
  screenId: string;
  skeletonViewer: SkeletonViewer;
}

type State = {
  visibilityOptions: VisibilityOption[];
  plaskSkeletonViewers: PlaskSkeletonViewer[];
};

const defaultState: State = {
  visibilityOptions: [],
  plaskSkeletonViewers: [],
};

export const screenData = (state = defaultState, action: ScreenDataAction) => {
  switch (action.type) {
    case 'screenDataAction/ADD_SCREEN': {
      return Object.assign({}, state, {
        visibilityOptions: [
          ...state.visibilityOptions,
          {
            screenId: action.payload.screenId,
            isBoneVisible: true,
            isMeshVisible: true,
            isControllerVisible: true,
            isGridVisible: true,
            isShadowVisible: true,
            isGizmoVisible: true,
            isIKControllerVisible: true,
          },
        ],
      });
    }
    case 'screenDataAction/REMOVE_SCREEN': {
      return Object.assign({}, state, {
        visibilityOptions: state.visibilityOptions.filter((visibilityOption) => visibilityOption.screenId !== action.payload.screenId),
      });
    }
    case 'screenDataAction/SET_BONE_VISIBILITY': {
      return Object.assign({}, state, {
        visibilityOptions: state.visibilityOptions.map((visibilityOption) =>
          visibilityOption.screenId === action.payload.screenId ? { ...visibilityOption, isBoneVisible: action.payload.value } : visibilityOption,
        ),
      });
    }
    case 'screenDataAction/SET_MESH_VISIBILITY': {
      return Object.assign({}, state, {
        visibilityOptions: state.visibilityOptions.map((visibilityOption) =>
          visibilityOption.screenId === action.payload.screenId ? { ...visibilityOption, isMeshVisible: action.payload.value } : visibilityOption,
        ),
      });
    }
    case 'screenDataAction/SET_CONTROLLER_VISIBILITY': {
      return Object.assign({}, state, {
        visibilityOptions: state.visibilityOptions.map((visibilityOption) =>
          visibilityOption.screenId === action.payload.screenId ? { ...visibilityOption, isControllerVisible: action.payload.value } : visibilityOption,
        ),
      });
    }
    case 'screenDataAction/SET_GRID_VISIBILITY': {
      return Object.assign({}, state, {
        visibilityOptions: state.visibilityOptions.map((visibilityOption) =>
          visibilityOption.screenId === action.payload.screenId ? { ...visibilityOption, isGridVisible: action.payload.value } : visibilityOption,
        ),
      });
    }
    case 'screenDataAction/SET_SHADOW_VISIBILITY': {
      return Object.assign({}, state, {
        visibilityOptions: state.visibilityOptions.map((visibilityOption) =>
          visibilityOption.screenId === action.payload.screenId ? { ...visibilityOption, isShadowVisible: action.payload.value } : visibilityOption,
        ),
      });
    }
    case 'screenDataAction/SET_GIZMO_VISIBILITY': {
      return Object.assign({}, state, {
        visibilityOptions: state.visibilityOptions.map((visibilityOption) =>
          visibilityOption.screenId === action.payload.screenId ? { ...visibilityOption, isGizmoVisible: action.payload.value } : visibilityOption,
        ),
      });
    }
    case 'screenDataAction/SET_IK_CONTROLLER_VISIBILITY': {
      return Object.assign({}, state, {
        visibilityOptions: state.visibilityOptions.map((visibilityOption) =>
          visibilityOption.screenId === action.payload.screenId ? { ...visibilityOption, isIKControllerVisible: action.payload.value } : visibilityOption,
        ),
      });
    }
    case 'screenDataAction/ADD_SKELETON_VIEWER': {
      return Object.assign({}, state, {
        plaskSkeletonViewers: [...state.plaskSkeletonViewers, { screenId: action.payload.screenId, skeletonViewer: action.payload.skeletonViewer }],
      });
    }
    case 'screenDataAction/REMOVE_SKELETON_VIEWER': {
      return Object.assign({}, state, {
        plaskSkeletonViewers: state.plaskSkeletonViewers.filter((plaskSkeletonViewer) => plaskSkeletonViewer.screenId !== action.payload.screenId),
      });
    }
    default: {
      return state;
    }
  }
};
