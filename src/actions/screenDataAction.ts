import { SkeletonViewer } from '@babylonjs/core';
import { PlaskSkeletonViewer } from '3d/assets/plaskSkeletonViewer';

export type ScreenDataAction =
  | ReturnType<typeof addScreen>
  | ReturnType<typeof removeScreen>
  | ReturnType<typeof setBoneVisibility>
  | ReturnType<typeof setMeshVisibility>
  | ReturnType<typeof setControllerVisibility>
  | ReturnType<typeof setGridVisibility>
  | ReturnType<typeof setShadowVisibility>
  | ReturnType<typeof setGizmoVisibility>
  | ReturnType<typeof setIKControllerVisibility>
  | ReturnType<typeof addSkeletonViewer>
  | ReturnType<typeof removeSkeletonViewer>;

const ADD_SCREEN = 'screenDataAction/ADD_SCREEN' as const;
const REMOVE_SCREEN = 'screenDataAction/REMOVE_SCREEN' as const;
const SET_BONE_VISIBILITY = 'screenDataAction/SET_BONE_VISIBILITY' as const;
const SET_MESH_VISIBILITY = 'screenDataAction/SET_MESH_VISIBILITY' as const;
const SET_CONTROLLER_VISIBILITY = 'screenDataAction/SET_CONTROLLER_VISIBILITY' as const;
const SET_GRID_VISIBILITY = 'screenDataAction/SET_GRID_VISIBILITY' as const;
const SET_SHADOW_VISIBILITY = 'screenDataAction/SET_SHADOW_VISIBILITY' as const;
const SET_GIZMO_VISIBILITY = 'screenDataAction/SET_GIZMO_VISIBILITY' as const;
const SET_IK_CONTROLLER_VISIBILITY = 'screenDataAction/SET_IK_CONTROLLER_VISIBILITY' as const;
const ADD_SKELETON_VIEWER = 'screenDataAction/ADD_SKELETON_VIEWER' as const;
const REMOVE_SKELETON_VIEWER = 'screenDataAction/REMOVE_SKELETON_VIEWER' as const;

interface AddScreen {
  screenId: string;
}

export const addScreen = (params: AddScreen) => ({
  type: ADD_SCREEN,
  payload: {
    ...params,
  },
});

interface RemoveScreen {
  screenId: string;
}

export const removeScreen = (params: RemoveScreen) => ({
  type: REMOVE_SCREEN,
  payload: {
    ...params,
  },
});

interface SetBoneVisibility {
  screenId: string;
  value: boolean;
}

export const setBoneVisibility = (params: SetBoneVisibility) => ({
  type: SET_BONE_VISIBILITY,
  payload: {
    ...params,
  },
});

interface SetMeshVisibility {
  screenId: string;
  value: boolean;
}

export const setMeshVisibility = (params: SetMeshVisibility) => ({
  type: SET_MESH_VISIBILITY,
  payload: {
    ...params,
  },
});

interface SetControllerVisibility {
  screenId: string;
  value: boolean;
}

export const setControllerVisibility = (params: SetControllerVisibility) => ({
  type: SET_CONTROLLER_VISIBILITY,
  payload: {
    ...params,
  },
});

interface SetGridVisibility {
  screenId: string;
  value: boolean;
}

export const setGridVisibility = (params: SetGridVisibility) => ({
  type: SET_GRID_VISIBILITY,
  payload: {
    ...params,
  },
});

interface SetShadowVisibility {
  screenId: string;
  value: boolean;
}

export const setShadowVisibility = (params: SetShadowVisibility) => ({
  type: SET_SHADOW_VISIBILITY,
  payload: {
    ...params,
  },
});

interface SetGizmoVisibility {
  screenId: string;
  value: boolean;
}

export const setGizmoVisibility = (params: SetGizmoVisibility) => ({
  type: SET_GIZMO_VISIBILITY,
  payload: {
    ...params,
  },
});
interface SetIKControllerVisibility {
  screenId: string;
  value: boolean;
}

export const setIKControllerVisibility = (params: SetIKControllerVisibility) => ({
  type: SET_IK_CONTROLLER_VISIBILITY,
  payload: {
    ...params,
  },
});

interface AddSkeletonViewer {
  screenId: string;
  skeletonViewer: SkeletonViewer | PlaskSkeletonViewer;
}

export const addSkeletonViewer = (params: AddSkeletonViewer) => ({
  type: ADD_SKELETON_VIEWER,
  payload: {
    ...params,
  },
});

interface RemoveSkeletonViewer {
  screenId: string;
}

export const removeSkeletonViewer = (params: RemoveSkeletonViewer) => ({
  type: REMOVE_SKELETON_VIEWER,
  payload: {
    ...params,
  },
});
