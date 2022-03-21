import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import * as BABYLON from '@babylonjs/core';

export type Nullable<T> = T | null;

export type ScreenXY = { x: number; y: number };

export type PlaskView = 'top' | 'bottom' | 'left' | 'right' | 'front' | 'back';

export type PlaskRotationType = 'euler' | 'quaternion';

export type PlaskPaletteColorName = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export type PlaskPaletteColor = '#FF6969' | '#FC9B51' | '#FFDB56' | '#4FD675' | '#61E4ED' | '#D687F4' | '#FF8CC9';

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

export type PlaskPose = {
  target: BABYLON.TransformNode;
  position: BABYLON.Vector3;
  rotationQuaternion: BABYLON.Quaternion;
  recurrentRotationQuaternion: BABYLON.Quaternion | null;
  scaling: BABYLON.Vector3;
};

export interface PlaskAsset {
  id: string;
  name: string;
  extension: string;
  meshes: BABYLON.AbstractMesh[];
  initialPoses: PlaskPose[];
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
  layers: PlaskLayer[];
}

export interface PlaskLayer {
  id: string;
  name: string;
  isIncluded: boolean;
  useFilter: boolean;
  tracks: PlaskTrack[];
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
  filterBeta: number;
  filterMinCutoff: number;
  isLocked: boolean;
}

export interface BezierParams {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
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

type ArrayOfThreeNumbers = [number, number, number];
export type ArrayOfFourNumbers = [number, number, number, number];

export type PlaskMocapData = Array<{
  boneName: RetargetSourceBoneType;
  property: PlaskProperty;
  fps: number;
  transformKeys: Array<{
    frame: number;
    time: number;
    value: ArrayOfThreeNumbers | ArrayOfFourNumbers;
  }>;
}>;

export type BvhBoneType =
  | 'Hips'
  | 'Chest'
  | 'Chest2'
  | 'Chest3'
  | 'Neck'
  | 'Head'
  | 'LeftCollar'
  | 'LeftUpArm'
  | 'LeftLowArm'
  | 'LeftHand'
  | 'RightCollar'
  | 'RightUpArm'
  | 'RightLowArm'
  | 'RightHand'
  | 'LeftUpLeg'
  | 'LeftLowLeg'
  | 'LeftFoot'
  | 'LeftToe'
  | 'RightUpLeg'
  | 'RightLowLeg'
  | 'RightFoot'
  | 'RightToe';

export type PlaskBvhMap = {
  [bone in BvhBoneType]: Nullable<string>;
};

export type ContextMenuClickItemHandlerProps = any;

export type SelectingData = {
  selectableObjects: Array<PlaskTransformNode>;
  selectedTargets: Array<PlaskTransformNode>;
  allObjectsMap: { [key: string]: PlaskTransformNode };
};

export type ButtonColor = 'primary' | 'secondary' | 'error';

export type ExportFormat = 'fbx' | 'fbx_unreal' | 'glb' | 'bvh';
