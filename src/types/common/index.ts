import { PlaskEntity } from '3d/entities/PlaskEntity';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { AbstractMesh, Animation, Bone, Geometry, IAnimationKey, Mesh, Quaternion, Scene, Skeleton, TransformNode, Vector3 } from '@babylonjs/core';
import { RequestNodeResponse } from 'types/LP';
import { Dispatch } from 'redux';

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
  uid: string; // uid -> id
  scenesLibraryUid: string; // don't know what is
  name: string;
  fps: number;
  isMocapAnimation: boolean;
  isDeleted: boolean;
}
export type ServerAnimationRequest = Omit<ServerAnimation, 'uid' | 'scenesLibraryUid'>;
export interface ServerAnimationLayer {
  uid: string;
  name: string;
  // isLocked: boolean; // related to TP node not the animation itself
  isIncluded: boolean; // from transformKey to here (including/excluding target is the layer not the keyframe)
  isDeleted: boolean;
  useFilter: boolean; // destructure filter related data
  tracks: ServerAnimationTrackRequest[]; // boneTracks -> tracks
}
export interface ServerAnimationLayerRequest extends Omit<ServerAnimationLayer, 'uid' | 'tracks'> {
  tracks: ServerAnimationTrackRequest[];
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
export interface ServerAnimationTrackRequest extends Omit<ServerAnimationTrack, 'transformKeysMap'> {
  transformKeysMap: ServerTransformKeyRequest[];
}

export interface VectorTransformKey {
  x: number;
  y: number;
  z: number;
}
export type QuaternionTransformKey = { w: number } & VectorTransformKey;
export interface ServerTransformKey {
  property: PlaskProperty; // quaternion -> rotationQuaternion
  transformKey: number | VectorTransformKey | QuaternionTransformKey;
  // isLocked: boolean;
}
export interface ServerTransformKeyRequest extends ServerTransformKey {
  frameIndex: number;
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

export type PlaskProperty = 'position' | 'rotation' | 'rotationQuaternion' | 'scaling' | 'inContact' | 'blend' | 'poleAngle' | 'isContact';
export const PlaskPropertyFormat: { [key in PlaskProperty]: number } = {
  position: Animation.ANIMATIONTYPE_VECTOR3,
  rotation: Animation.ANIMATIONTYPE_VECTOR3,
  rotationQuaternion: Animation.ANIMATIONTYPE_QUATERNION,
  scaling: Animation.ANIMATIONTYPE_VECTOR3,
  inContact: Animation.ANIMATIONTYPE_FLOAT,
  blend: Animation.ANIMATIONTYPE_FLOAT,
  poleAngle: Animation.ANIMATIONTYPE_FLOAT,
  isContact: Animation.ANIMATIONTYPE_FLOAT,
};
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

export type ArrayOfThreeNumbers = [number, number, number];
export type ArrayOfFourNumbers = [number, number, number, number];

export type PlaskMocapData = Array<{
  boneName: RetargetSourceBoneType;
  property: PlaskProperty;
  fps: number;
  transformKeys: Array<{
    frame: number;
    time: number;
    value: ArrayOfThreeNumbers | ArrayOfFourNumbers | number;
  }>;
}>;

export type MocapJson = {
  result: {
    motionNumber: number;
    trackData: PlaskMocapData;
  }[];
  id: string;
  workingtime: number;
};

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

export type ButtonColor = 'default' | 'primary' | 'negative' | 'temp-purple' | 'temp-purple-2';

export type ExportFormat = 'fbx' | 'fbx_unreal' | 'glb' | 'bvh';

export interface ServerAnimationResponse extends ServerAnimation {
  scenesLibraryModelAnimationLayers: ServerAnimationLayer[];
}

export interface MocapDataResponse {
  id: number;
  uid: string;
  assetsId: number;
  data: {
    motionNumber: number;
    trackData: PlaskMocapData;
  }[];
}

export type TooltipArrowPlacement =
  | 'top-start'
  | 'top-middle'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-middle'
  | 'bottom-end'
  | 'left-start'
  | 'left-middle'
  | 'left-end'
  | 'right-start'
  | 'right-middle'
  | 'right-end';

export type UserResponse = {
  uid: string;
  email: string;
  password: string;
  encKey: string;
  country: string;
  jobs: string;
  name: string;
  isEmailVerified: boolean;
  isMarketingChecked: boolean;
  isPrivacyChecked: boolean;
  isDeleted: boolean;
  hadFreeTrial: boolean;
};

export type UserUsageInfoResponse = {
  planType: 'freemium' | 'pro_active' | 'pro_trialing';
  planName: string;
  upcomingInvoice: number;
  payment: {
    type: string;
    nextPaymentDate: string;
  };
  credits: {
    remaining: number;
    nextChargeCredit: number;
    nextChargeDate: string;
  };
  storage: {
    usageSize: number;
    limitSize: number;
  };
  stipe: {
    paymentMethodUrl: string;
    billingInvoiceUrl: string;
  };
};

export interface UserCreditInfoResponse {
  remainingCredit: number;
  totalCredit: number;
}

export interface UserState {
  name: string;
  hadFreeTrial: boolean;
  planName: string;
  planType: UserUsageInfoResponse['planType'];
  credits: UserUsageInfoResponse['credits'] | null;
  storage: UserUsageInfoResponse['storage'] | null;
}

export interface InitAppRequest {
  sceneId: string;
  token: string;
  nodes: RequestNodeResponse[];
  dispatch: Dispatch;
}
