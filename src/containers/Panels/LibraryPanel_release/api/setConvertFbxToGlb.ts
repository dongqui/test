import axios from 'axios';

const BLENDER_BASE_URL = 'https://blenderapi.myplask.com:5000';

/**
 * fbx를 업로드하여 glb를 받는 api
 *
 * @param file - 업로드할 파일
 * @param type - 파일 타입 (fbx)
 *
 * @returns glb 파일의 url
 */

interface SetConvertFbxToGlb {
  file: File;
  type: 'fbx';
}

interface ResponseType {
  result: string;
  isError: boolean;
  errorMsg: string;
}

const setConvertFbxToGlb = async (params: SetConvertFbxToGlb): Promise<ResponseType> => {
  const { file, type } = params;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('id', String(Date.now() / 1000));
  try {
    const result = await axios({
      method: 'POST',
      baseURL: BLENDER_BASE_URL,
      url: '/fbx2glb-upload-api',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (result?.data?.result) {
      return {
        result: result.data.result,
        isError: false,
        errorMsg: '',
      };
    } else {
      return {
        result: '',
        isError: true,
        errorMsg: 'Data does not exist',
      };
    }
  } catch (error) {
    return {
      result: '',
      isError: true,
      errorMsg: error,
    };
  }
};

export default setConvertFbxToGlb;
