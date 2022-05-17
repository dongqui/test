import { PlaskMocapData, PlaskRetargetMap, ServerAnimation, ServerAnimationLayer, ServerAnimationRequest, ServerAnimationLayerRequest } from 'types/common';

interface scenesLibraryModelAnimation extends ServerAnimation {
  scenesLibraryModelAnimationLayers: ServerAnimationLayer[];
}

export interface RequestNodeResponse {
  uid: string;
  type: 'MOCAP' | 'DIRECTORY' | 'MODEL';
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  retargetMap: Omit<PlaskRetargetMap, 'id' | 'assetId'>;
  parentUid: string;
  scenesUid: string;
  assetsUid: string;
  modelUrl?: string;
  mocap?: PlaskMocapData;
  scenesLibraryModelAnimations?: scenesLibraryModelAnimation[];
}
export interface CreateFolderOrMocapBodyData {
  name: string;
  type: 'DIRECTORY' | 'MOCAP';
  data: string[];
}

export interface AddModelResponse extends RequestNodeResponse {
  type: 'MODEL';
  modelUrl: string;
}

export interface PostMotionData {
  animation: ServerAnimationRequest;
  animationLayer: ServerAnimationLayerRequest[];
}
