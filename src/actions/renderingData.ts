import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

export type RenderingDataAction =
  | ReturnType<typeof setCurrentBone>
  | ReturnType<typeof setScene>
  | ReturnType<typeof setDirectionalLight>
  | ReturnType<typeof setSkeletonHelper>
  | ReturnType<typeof setCameraControls>
  | ReturnType<typeof setTransformControls>;

// 기존 renderingData 들어가야 함

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
