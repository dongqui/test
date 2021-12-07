import requestApi from './requestApi';

const convertModel = async (file: File, extension: 'glb' | 'fbx') => {
  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('type', extension);
    formData.append('id', String(Date.now() / 1000));

    const response = await requestApi({
      method: 'POST',
      base: 'https://dev.plask.ai/api',
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
