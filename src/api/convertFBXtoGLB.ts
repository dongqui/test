import requestApi from './requestApi';
import axios from 'axios';

/**
 *
 * @param file 변환할 fbx 파일
 * @returns 변환된 glb 파일
 */
const convertFBXtoGLB = async (file: File) => {
  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('type', 'glb');
    formData.append('id', String(Date.now() / 1000));

    const response = await requestApi({
      method: 'POST',
      // baseURL: 'https://blenderapi.myplask.com:5000',
      base: 'https://dev.plask.ai/api',
      url: '/converter/model',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // const response = await axios({
    //   method: 'POST',
    //   baseURL: 'https://blenderapi.myplask.com:5000',
    //   url: '/fbx2glb-upload-api',
    //   data: formData,
    //   headers: { 'Content-Type': 'multipart/form-data' },
    // });

    return response.data.url;
  } catch (error) {
    throw error;
  }
};

export default convertFBXtoGLB;
