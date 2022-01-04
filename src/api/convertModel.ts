import requestApi from './requestApi';
import { PlaskBvhMap } from 'types/common';

const convertModel = async (file: File, extension: 'glb' | 'fbx' | 'bvh', map?: PlaskBvhMap) => {
  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('type', extension);
    formData.append('id', String(Date.now() / 1000));

    if (extension === 'bvh' && map) {
      formData.append('stringifyBoneMap', JSON.stringify(map));
    }

    const response = await requestApi({
      method: 'POST',
      base: process.env.NEXT_PUBLIC_BACKEND_URL,
      url: '/converter/model',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.url;
  } catch (error) {
    throw error;
  }
};

export default convertModel;
