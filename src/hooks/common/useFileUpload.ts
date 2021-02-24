import AWS from 'aws-sdk';
import axios from 'axios';
import _ from 'lodash';
import sha1 from 'sha1';

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const bucketName = 'shoot-bucket';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/plask';

export const fnFileUpload = async ({ file }: { file: File }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', `${process.env.NEXT_PUBLIC_CLOUDINARY_APIKEY}`);
  formData.append('upload_preset', 'plaskpublic');
  formData.append('return_delete_token', 'true');
  const timestamp = String(Date.now() / 1000);
  formData.append('timestamp', timestamp);
  const signature = sha1(
    `return_delete_token=true&timestamp=${timestamp}&upload_preset=plaskpublic${process.env.NEXT_PUBLIC_CLOUDINARY_SECRET}`,
  );
  formData.append('signature', signature);
  try {
    const {
      data: { secure_url, public_id, delete_token },
    } = await axios.post(`${CLOUDINARY_URL}/upload`, formData);
    return {
      url: secure_url,
      error: false,
      token: delete_token,
    };
  } catch (error) {
    return {
      error: true,
      msg: error,
    };
  }
};
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
