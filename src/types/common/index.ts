import * as BABYLON from '@babylonjs/core';

export type Nullable<T> = T | null;

export type ScreenXY = { x: number; y: number };

export type PlaskView = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';

export type PlaskRotationType = 'euler' | 'quaternion';

export interface PlaskProject {
  id: string;
  name: string;
  screenList: PlaskScreen[];
  assetList: PlaskAsset[];
  visualizedAssetIds: string[];
  fps: number;
}

export interface PlaskScreen {
  id: string;
  scene: BABYLON.Scene;
  canvasId: string;
  hasShadow: boolean;
  hasGroundTexture: boolean;
}

export interface PlaskAsset {
  id: string;
  name: string;
  extension: string;
  meshes: BABYLON.AbstractMesh[];
  geometries: BABYLON.Geometry[];
  skeleton: BABYLON.Skeleton;
  bones: BABYLON.Bone[];
  transformNodes: BABYLON.TransformNode[];
  animationIngredientIds: string[];
  retargetMapId: string;
}

export interface AnimationIngredient {
  id: string;
  name: string;
  assetId: string;
  current: boolean;
  tracks: PlaskTrack[];
  layers: PlaskLayer[];
}

export type PlaskProperty = 'position' | 'rotation' | 'rotationQuaternion' | 'scaling';
export type PlaskAxis = 'x' | 'y' | 'z' | 'w';

export interface PlaskTrack {
  id: string;
  targetId: string;
  layerId: string;
  name: string;
  property: PlaskProperty;
  target: BABYLON.TransformNode | BABYLON.Mesh;
  transformKeys: BABYLON.IAnimationKey[];
  interpolationType: 'linear' | 'bezier' | 'constant';
  bezierParams?: BezierParams;
  isMocapAnimation: boolean;
  useFilter: boolean;
  filterBeta: number;
  filterMinCutoff: number;
  isIncluded: boolean;
  isLocked: boolean;
}

export interface BezierParams {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface PlaskLayer {
  id: string;
  name: string;
}

export type RetargetSourceBoneType =
  | 'hips'
  | 'leftUpLeg'
  | 'rightUpLeg'
  | 'spine'
  | 'leftLeg'
  | 'rightLeg'
  | 'spine1'
  | 'leftFoot'
  | 'rightFoot'
  | 'spine2'
  | 'leftToeBase'
  | 'rightToeBase'
  | 'neck'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'head'
  | 'leftArm'
  | 'rightArm'
  | 'leftForeArm'
  | 'rightForeArm'
  | 'leftHand'
  | 'rightHand'
  | 'leftHandIndex1'
  | 'rightHandIndex1';

export type PlaskRetargetMap = {
  id: string;
  assetId: string;
  hipSpace: number;
  values: RetargetMapValue[];
};

export type RetargetMapValue = {
  sourceBoneName: RetargetSourceBoneType;
  targetTransformNodeId: Nullable<string>;
};

export interface SerializedBone {
  id: string;
  linkedTransformNodeId: string;
  parentBoneIndex: number;
  name: string;
  index: number;
  rest: Float32Array;
  matrix: BABYLON.Matrix;
}
