import AWS from 'aws-sdk';
import axios from 'axios';
import _ from 'lodash';

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const bucketName = 'shoot-bucket';

export const fnFileUpload = async ({ file }: { file: File }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', `${process.env.NEXT_PUBLIC_CLOUDINARY_APIKEY}`);
  formData.append('upload_preset', 'plaskpublic');
  const timeStamp = String(Date.now() / 1000);
  formData.append('timestamp', timeStamp);
  try {
    const {
      data: { secure_url },
    } = await axios.post('https://api.cloudinary.com/v1_1/plask/upload', formData);
    return {
      url: secure_url,
      error: false,
    };
  } catch (error) {
    return {
      error: true,
      msg: error,
    };
  }
};
