import * as BABYLON from '@babylonjs/core';

export const DEFAULT_SKELETON_VIEWER_OPTION = {
  pauseAnimations: false,
  returnToRest: false,
  computeBonesUsingShaders: true,
  useAllBones: true, // error with false
  displayMode: BABYLON.SkeletonViewer.DISPLAY_SPHERE_AND_SPURS,
  displayOptions: {
    sphereBaseSize: 0.01,
    sphereScaleUnit: 15,
    sphereFactor: 0.9,
    midStep: 0.25,
    midStepFactor: 0.05,
  },
};

//////////////////// new ////////////////////

// filterFunction params(beta, minCutoff)의 기본값
// mocap 결과물이 아닌 경우, 항등원 성격의 0, 0을 사용합니다.
export const DEFAULT_BETA = 0.0;
export const DEFAULT_MIN_CUTOFF = 1.0;
// mocap 결과물인 경우, 다시 position / rotationQuaternion으로 구분한 기본값을 사용합니다.
export const MOCAP_POSITION_BETA = 0.002;
export const MOCAP_POSITION_MIN_CUTOFF = 0.05;
export const MOCAP_QUATERNION_BETA = 0.3;
export const MOCAP_QUATERNION_MIN_CUTOFF = 3.0;

// 리타겟맵에서 source bone이 의도적으로 target bone과 mapping하지 않을 때 사용합니다.
export const RETARGET_TARGET_BONE_NONE = 'none';
