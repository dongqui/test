import * as BABYLON from '@babylonjs/core';

export interface ShootProject {
  id: string;
  sceneList: ShootScene[];
  assetList: ShootAsset[];
  visualizedAssetIds: string[];
  fileToLoad: string | File | null;
  assetIdToAdd: string | null;
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
  joints: BABYLON.Mesh[];
  controllers: BABYLON.Mesh[];
  animationIngredients: AnimationIngredient[];
  currentAnimationIngredientId: string;
  retargetMap: ShootRetargetMap;
  boneVisibleSceneIds: string[];
  meshVisibleSceneIds: string[];
  hasControllersSceneIds: string[];
}

export interface AnimationIngredient {
  id: string;
  name: string;
  tracks: ShootTrack[];
  layers: ShootLayer[];
}

type Property = 'position' | 'rotationQuaternion' | 'scaling';
type Axis = 'x' | 'y' | 'z' | 'w';

export interface ShootTrack {
  targetId: string;
  layerId: string;
  property: Property;
  axis: Axis;
  transformKeys: BABYLON.IAnimationKey[];
  interpolationType: 'bezier' | 'linear' | 'constant';
  bezierParams?: BezierParams;
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

export type ShootRetargetMap = {
  [sourceBone in RetargetSourceBoneType]: {
    targetBoneId?: string;
    hipSpace: number;
  };
};
