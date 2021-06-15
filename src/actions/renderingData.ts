import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

export type RenderingDataAction =
  | ReturnType<typeof setCurrentBone>
  | ReturnType<typeof setScene>
  | ReturnType<typeof setDirectionalLight>
  | ReturnType<typeof setSkeletonHelper>
  | ReturnType<typeof setCameraControls>
  | ReturnType<typeof setTransformControls>
  | ReturnType<typeof setAxis>
  | ReturnType<typeof setIsBoneOn>
  | ReturnType<typeof setIsMeshOn>
  | ReturnType<typeof setIsShadowOn>
  | ReturnType<typeof setPosition>
  | ReturnType<typeof setQuaternion>
  | ReturnType<typeof setRotation>
  | ReturnType<typeof setScale>;

// 기존 renderingData
interface SetAxis {
  axis: 'y' | 'z';
}
export const SET_AXIS = 'renderingData/SET_AXIS' as const;
export const setAxis = (params: SetAxis) => ({
  type: SET_AXIS,
  payload: {
    ...params,
  },
});

interface SetIsBoneOn {
  isBoneOn: boolean;
}
export const SET_IS_BONE_ON = 'renderingData/SET_IS_BONE_ON' as const;
export const setIsBoneOn = (params: SetIsBoneOn) => ({
  type: SET_IS_BONE_ON,
  payload: {
    ...params,
  },
});

interface SetIsMeshOn {
  isMeshOn: boolean;
}
export const SET_IS_MESH_ON = 'renderingData/SET_IS_MESH_ON' as const;
export const setIsMeshOn = (params: SetIsMeshOn) => ({
  type: SET_IS_MESH_ON,
  payload: {
    ...params,
  },
});

interface SetIsShadowOn {
  isShadowOn: boolean;
}
export const SET_SHADOW_ON = 'renderingData/SET_SHADOW_ON' as const;
export const setIsShadowOn = (params: SetIsShadowOn) => ({
  type: SET_SHADOW_ON,
  payload: {
    ...params,
  },
});

type Axis = 'x' | 'y' | 'z';

interface SetPosition {
  axis: Axis;
  value: number;
}
export const SET_POSITION = 'renderingData/SET_POSITION' as const;
export const setPosition = (params: SetPosition) => ({
  type: SET_POSITION,
  payload: {
    ...params,
  },
});

interface SetQuaternion {
  axis: Axis | 'w';
  value: number;
}
export const SET_QUATERNION = 'renderingData/SET_QUATERNION' as const;
export const setQuaternion = (params: SetQuaternion) => ({
  type: SET_QUATERNION,
  payload: {
    ...params,
  },
});

interface SetRotation {
  axis: Axis;
  value: number;
}
export const SET_ROTATION = 'renderingData/SET_ROTATION' as const;
export const setRotation = (params: SetRotation) => ({
  type: SET_ROTATION,
  payload: {
    ...params,
  },
});

interface SetScale {
  axis: Axis;
  value: number;
}
export const SET_SCALE = 'renderingData/SET_SCALE' as const;
export const setScale = (params: SetScale) => ({
  type: SET_SCALE,
  payload: {
    ...params,
  },
});

// Three 내부 요소
interface SetCurrentBone {
  bone: THREE.Bone;
}
export const SET_CURRENT_BONE = 'renderingData/SET_CURRENT_BONE' as const;
export const setCurrentBone = (params: SetCurrentBone) => ({
  type: SET_CURRENT_BONE,
  payload: {
    ...params,
  },
});

interface SetScene {
  scene: THREE.Scene;
}
export const SET_SCENE = 'renderingData/SET_SCENE' as const;
export const setScene = (params: SetScene) => ({
  type: SET_SCENE,
  payload: {
    ...params,
  },
});

interface SetDirectionalLight {
  directionalLight: THREE.DirectionalLight;
}
export const SET_DIRECTIONAL_LIGHT = 'renderingData/SET_DIRECTIONAL_LIGHT' as const;
export const setDirectionalLight = (params: SetDirectionalLight) => ({
  type: SET_DIRECTIONAL_LIGHT,
  payload: {
    ...params,
  },
});

interface SetSkeletonHelper {
  skeletonHelper: THREE.SkeletonHelper;
}
export const SET_SKELETON_HELPER = 'renderingData/SET_SKELETON_HELPER' as const;
export const setSkeletonHelper = (params: SetSkeletonHelper) => ({
  type: SET_SKELETON_HELPER,
  payload: {
    ...params,
  },
});

interface SetCameraControls {
  cameraControls: OrbitControls;
}
export const SET_CAMERA_CONTROLS = 'renderingData/SET_CAMERA_CONTROLS' as const;
export const setCameraControls = (params: SetCameraControls) => ({
  type: SET_CAMERA_CONTROLS,
  payload: {
    ...params,
  },
});

interface SetTransformControls {
  transformControls: TransformControls;
}
export const SET_TRANSFORM_CONTROLS = 'renderingData/SET_TRANSFORM_CONTROLS' as const;
export const setTransformControls = (params: SetTransformControls) => ({
  type: SET_TRANSFORM_CONTROLS,
  payload: {
    ...params,
  },
});
