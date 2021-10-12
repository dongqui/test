import * as BABYLON from '@babylonjs/core';

export type Nullable<T> = T | null;
export type ScreenXY = { x: number; y: number };

export interface ShootProject {
  id: string;
  sceneList: ShootScene[];
  assetList: ShootAsset[];
  visualizedAssetIds: string[];
  fileToLoad: string | File | null;
  assetIdToRender: string | null;
  assetIdToUnrender: string | null;
  assetIdToRemove: string | null;
  fps: number;
}

export interface ShootScene {
  id: string;
  name: string;
  scene: BABYLON.Scene;
  canvasId: string;
  hasShadow: boolean;
  hasGroundTexture: boolean;
}

export interface ShootAsset {
  id: string;
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
  tracks: ShootTrack[];
  layers: ShootLayer[];
}

export type ShootProperty = 'position' | 'rotationQuaternion' | 'scaling';
export type ShootAxis = 'x' | 'y' | 'z' | 'w';

export interface ShootTrack {
  targetId: string;
  layerId: string;
  name: string;
  property: ShootProperty;
  axis: ShootAxis;
  target: BABYLON.TransformNode | BABYLON.Mesh;
  transformKeys: BABYLON.IAnimationKey[];
  interpolationType: 'linear' | 'bezier' | 'constant';
  bezierParams?: BezierParams;
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

export interface ShootLayer {
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

export type ShootRetargetMap = { id: string; assetId: string } & {
  [sourceBone in RetargetSourceBoneType]: {
    targetBoneId?: string;
    hipSpace: number;
  };
};
