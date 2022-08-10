import { PlaskSkeletonViewer } from '3d/assets/plaskSkeletonViewer';
import { SkeletonViewer } from '@babylonjs/core';

export const DEFAULT_SKELETON_VIEWER_OPTION = {
  pauseAnimations: false,
  returnToRest: false,
  computeBonesUsingShaders: true,
  useAllBones: true, // error with false
  displayMode: SkeletonViewer.DISPLAY_SPHERE_AND_SPURS,
  displayOptions: {
    sphereBaseSize: 0.01,
    sphereScaleUnit: 15,
    sphereFactor: 0.9,
    midStep: 0.25,
    midStepFactor: 0.05,
  },
};
export const IK_SKELETON_VIEWER_OPTION = {
  pauseAnimations: false,
  returnToRest: false,
  computeBonesUsingShaders: true,
  useAllBones: true, // error with false
  // NEED TO FIX THE CODE
  displayMode: PlaskSkeletonViewer.DISPLAY_SPURS,
  displayOptions: {
    midStep: 0.25,
    midStepFactor: 0.05,
  },
};

export const RESULT_SKELETON_VIEWER_OPTION = {
  displayMode: PlaskSkeletonViewer.DISPLAY_SPURS,
};

//////////////////// new ////////////////////

// default values for filterFunction params(beta, minCutoff)
// case of normal motion
export const DEFAULT_BETA = 0.0;
export const DEFAULT_MIN_CUTOFF = 1.0;
// case of mocap motion
export const MOCAP_POSITION_BETA = 0.002;
export const MOCAP_POSITION_MIN_CUTOFF = 0.05;
export const MOCAP_QUATERNION_BETA = 0.3;
export const MOCAP_QUATERNION_MIN_CUTOFF = 3.0;

// use constant below, when user want to assign a source bone to none of target bone
export const RETARGET_TARGET_BONE_NONE = 'none';
export const VM_ON_BOARDING_KEY = 'vm_onboarding';
