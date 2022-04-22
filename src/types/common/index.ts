import { PlaskEntity } from '3d/entities/PlaskEntity';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { AbstractMesh, Bone, Geometry, IAnimationKey, Mesh, Quaternion, Scene, Skeleton, TransformNode, Vector3 } from '@babylonjs/core';

export enum GizmoMode {
  POSITION,
  ROTATION,
  SCALE,
}

export enum GizmoSpace {
  WORLD,
  LOCAL,
}

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
  scene: Scene;
  canvasId: string;
  hasShadow: boolean;
  hasGroundTexture: boolean;
}

export type PlaskPose = {
  target: TransformNode;
  position: Vector3;
  rotationQuaternion: Quaternion;
  recurrentRotationQuaternion: Quaternion | null;
  scaling: Vector3;
};

export interface PlaskAsset {
  id: string;
  name: string;
  extension: string;
  meshes: AbstractMesh[];
  initialPoses: PlaskPose[];
  geometries: Geometry[];
  skeleton: Skeleton;
  bones: Bone[];
  transformNodes: TransformNode[];
  animationIngredientIds: string[];
  retargetMapId: string;
}

export interface ServerAnimation {
  id: string; // uid -> id
  scenesLibraryId: string; // don't know what is
  name: string;
  fps: number;
  isMocapAnimation: boolean;
  isDeleted: boolean;
}

export interface ServerAnimationLayer {
  id: string; // uid -> id
  animationId: string; // scenes_library_model_animation_id -> animationId
  name: string;
  // isLocked: boolean; // related to TP node not the animation itself
  isIncluded: boolean; // from transformKey to here (including/excluding target is the layer not the keyframe)
  isDeleted: boolean;
  useFilter: boolean; // destructure filter related data
  tracks: ServerAnimationTrack[]; // boneTracks -> tracks
}

// BoneTrack -> NameTrack
export interface ServerAnimationTrack {
  id: string;
  targetId: string; // boneId -> targetId
  name: string;
  property: PlaskProperty; // to identify a track by combine targetId and property + should be able to control tracks independantly
  // isShown: boolean; // isShow -> isShown + related to TP node not the animation itself
  // isLocked: boolean; // related to TP node not the animation itself
  filterBeta: number;
  filterMinCutoff: number;
  transformKeysMap: Map<number, ServerTransformKey>; // boneFrameMap -> transformKeysMap
}

export interface VectorTransformKey {
  x: number;
  y: number;
  z: number;
}
export type QuaternionTransformKey = { w: number } & VectorTransformKey;
export interface ServerTransformKey {
  property: PlaskProperty; // quaternion -> rotationQuaternion
  transformKey: VectorTransformKey | QuaternionTransformKey;
  // isLocked: boolean;
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
  target: TransformNode | Mesh;
  transformKeys: IAnimationKey[];
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
  allEntitiesMap: { [key: string]: PlaskEntity };
};

export type ButtonColor = 'primary' | 'secondary' | 'negative';

export type ExportFormat = 'fbx' | 'fbx_unreal' | 'glb' | 'bvh';
