import requestApi from '../requestApi';

const TEST_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwcjA4a2wybXZkOW5lN29scWoxcXozcHlyNDV4ZzZwbCIsImVtYWlsIjoiemwwNzU5dmtAbmF2ZXIuY29tIiwiand0VHlwZSI6ImxvZ2luIiwiaWF0IjoxNjQ1MTQyMzAzLCJleHAiOjE2NTAzMjYzMDN9.Ut8mlSSK6b_VZnJ9tZ0uvcsH9-zrbIMU8fRupG7OFqI';

export async function getNodes(sceneId: string, parentId?: string) {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}${parentId ? `/${parentId}` : ''}`,
    headers: {
      authorization: TEST_TOKEN,
    },
  });

  return response.data;
}

export interface CreateFolderOrMocapParams {
  sceneId: string;
  parentId?: string;
  data: {
    name: string;
    type: 'FOLDER' | 'MOCAP';
    data: string[];
  };
}
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

export async function createFolderOrMocap({ sceneId, data, parentId }: CreateFolderOrMocapParams) {
  const response = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}${parentId ? `/${parentId}` : ''}`,
    data,
    headers: {
      authorization: TEST_TOKEN,
    },
  });

  return response.data;
}
