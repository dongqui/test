import { MutableRefObject } from 'react';
import requestApi from '../requestApi';
import { CreateFolderOrMocapBodyData, PostMotionData } from 'types/LP';
import { PlaskRetargetMap } from 'types/common';
import axios, { Canceler } from 'axios';

export async function getNodes(sceneId: string) {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/get/${sceneId}/library`,
  });

  return response.data;
}

export async function createFolderOrMocap(sceneId: string, data: CreateFolderOrMocapBodyData, parentId?: string) {
  const response = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}${parentId ? `/${parentId}` : ''}`,
    data,
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
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function addMocap(sceneId: string, formData: FormData, cancelTokenRef: MutableRefObject<Canceler | undefined>) {
  const response = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}/mocap`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    cancelToken: new axios.CancelToken((cancel) => {
      cancelTokenRef.current = cancel;
    }),
  });
  return response.data;
}

export async function createRetargetMap(sceneId: string, libraryId: string, data: Omit<PlaskRetargetMap, 'id' | 'assetId'>) {
  const response = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}/${libraryId}/retarget-map`,
    data,
  });

  return response.data;
}

export async function postMotion(sceneId: string, libraryId: string, data: PostMotionData) {
  const response = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}/${libraryId}/motion`,
    data,
  });

  return response.data;
}
