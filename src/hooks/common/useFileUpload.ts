import AWS from 'aws-sdk';
import axios from 'axios';
import _ from 'lodash';
import sha1 from 'sha1';

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const bucketName = 'shoot-bucket';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/plask';
const baseURL = 'https://blenderapi.myplask.com:5000';

export const fnFileDelete = async ({ token }: { token: string }) => {
  const formData = new FormData();
  formData.append('token', token);
  try {
    await axios.post(`${CLOUDINARY_URL}/delete_by_token`, formData);
    return {
      error: false,
    };
  } catch (error) {
    return {
      error: true,
      msg: error,
    };
  }
};
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
