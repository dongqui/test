import { MutableRefObject } from 'react';
import requestApi from '../requestApi';
import { CreateFolderOrMocapBodyData, PostMotionData, addMocapByJsonData, PutMotionData } from 'types/LP';
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

export async function addModel(sceneId: string, originalFileName: string, fileKey: string, parentId?: string) {
  const formData = new FormData();

  formData.append('originalFileName', originalFileName);
  formData.append('fileKey', fileKey);
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

export async function addMocapByJson(sceneId: string, data: addMocapByJsonData) {
  const response = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}/json`,
    data,
  });
  return response.data;
}

export async function putRetargetMap(sceneId: string, libraryId: string, data: Omit<PlaskRetargetMap, 'id' | 'assetId'>) {
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
export async function replaceMotion(sceneId: string, libraryId: string, animationId: string, data: PutMotionData) {
  const response = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/${sceneId}/${libraryId}/${animationId}/replace`,
    data,
  });

  return response.data;
}

export async function getAnimation(animationId: string) {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/library/get/${animationId}/animations`,
  });

  return response.data;
}

// export async function getMocapData(mocapId: string) {
export async function getMocapData(scenesId: string, libraryId: string) {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    // url: `/library/get/${mocapId}/mocap`,
    url: `/library/get/${scenesId}/${libraryId}/mocap`,
  });

  return response.data;
}

interface UploadResult {
  originalFileName: string;
  fileKey: string;
  headers: {
    'Content-Type': string;
    'x-amz-tagging': string;
  };
  url: string;
}
export async function upload(file: File): Promise<{
  originalFileName: string;
  fileKey: string;
}> {
  const { data }: { data: UploadResult } = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/upload?filename=${file.name}`,
  });

  await axios.put(data.url, file, {
    headers: data.headers,
  });

  return {
    originalFileName: file.name,
    fileKey: data.fileKey,
  };
}
