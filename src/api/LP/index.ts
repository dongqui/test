import requestApi from '../requestApi';
import { CreateFolderOrMocapBodyData } from 'types/LP';

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

export async function createFolderOrMocap(sceneId: string, data: CreateFolderOrMocapBodyData, parentId?: string) {
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

export async function addModel(sceneId: string, file: File, parentId?: string) {
  const formData = new FormData();

  formData.append('file', file);
  if (parentId) {
    formData.append('parentId', parentId);
  }

  const response = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}/model`,
    data: formData,
    headers: {
      authorization: TEST_TOKEN,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
