import { ScreenDataAction } from 'actions/screenDataAction';

interface VisibilityOption {
  screenId: string;
  isBoneVisible: boolean;
  isMeshVisible: boolean;
  isControllerVisible: boolean;
  isGridVisible: boolean;
  isShadowVisible: boolean;
  isGizmoVisible: boolean;
}

type State = {
  visibilityOptions: VisibilityOption[];
};

const defaultState: State = {
  visibilityOptions: [],
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
    default: {
      return state;
    }
  }
};
