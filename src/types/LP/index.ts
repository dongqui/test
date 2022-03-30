export interface CreateFolderOrMocapResponse {
  uid: string;
  type: 'MOCAP' | 'DIRECTORY';
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  retargetMap: {};
  parentUid: string;
  scenesUid: string;
  assetsUid: string;
  modelUrl: string;
}

export interface CreateFolderOrMocapBodyData {
  name: string;
  type: 'DIRECTORY' | 'MOCAP';
  data: string[];
}

export interface AddModelResponse {
  assetsUid: string;
  createdAt: string;
  isDeleted: boolean;
  modelUrl: string;
  name: string;
  parentUid: string;
  scenesUid: string;
  type: 'MODEL';
  uid: string;
  updatedAt: string;
}
