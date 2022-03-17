export interface CreateFolderOrMocapResponse {
  uid: string;
  type: 'MOCAP' | 'FOLDER';
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
  type: 'FOLDER' | 'MOCAP';
  data: string[];
}
