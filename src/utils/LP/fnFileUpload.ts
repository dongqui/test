import axios from 'axios';
import _ from 'lodash';

const baseURL = 'https://blenderapi.myplask.com:5000';

export const fnFileUpload = async ({ file, type }: { file: File; type: string }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('id', String(Date.now() / 1000));
  try {
    const result = await axios({
      method: 'POST',
      url: `${baseURL}/fbx2glb-upload-api`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      url: result?.data?.result,
      error: false,
    };
  } catch (error) {
    return {
      error: true,
      msg: error,
    };
  }
};
