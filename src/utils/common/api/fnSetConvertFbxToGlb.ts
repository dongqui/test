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

interface FnSetConvertFbxToGlb {
  file: File;
}

interface ResponseType {
  result: string;
  isError: boolean;
  errorMessage: string;
}

const fnSetConvertFbxToGlb = async (params: FnSetConvertFbxToGlb): Promise<ResponseType> => {
  const { file } = params;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'fbx');
  formData.append('id', String(Date.now() / 1000));
  try {
    const result = await axios({
      method: 'POST',
      baseURL: BLENDER_BASE_URL,
      url: '/fbx2glb-upload-api',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then((result) => result?.data.result)
      .catch((e) => {
        throw Error(e);
      });
    if (result) {
      return {
        result,
        isError: false,
        errorMessage: '',
      };
    } else {
      return {
        result: '',
        isError: true,
        errorMessage: 'Data does not exist',
      };
    }
  } catch (error) {
    return {
      result: '',
      isError: true,
      errorMessage: error,
    };
  }
};

export default fnSetConvertFbxToGlb;
