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
