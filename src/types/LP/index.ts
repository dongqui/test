import { PlaskMocapData } from 'types/common';

export interface RequestNodeResponse {
  uid: string;
  type: 'MOCAP' | 'DIRECTORY' | 'MODEL';
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  retargetMap: {};
  parentUid: string;
  scenesUid: string;
  assetsUid: string;
  modelUrl?: string;
  mocap?: PlaskMocapData;
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
