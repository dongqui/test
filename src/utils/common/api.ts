import axios from 'axios';
import { FORMAT_TYPES, VIDEO_FORMAT_TYPES } from 'types';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { fnConvertBloburlToFile } from './fnConvertBloburlToFile';

const BASE_URL = 'https://shootapi.myplask.com:5000';
const BLENDER_BASE_URL = 'https://blenderapi.myplask.com:5000/';

interface uploadFileToMotionDataProps {
  type: VIDEO_FORMAT_TYPES | string;
  url: string;
  id: string;
  start: number;
  end: number;
  fileName: string;
}
export const uploadFbxToGlb = async ({ file, type }: { file: File; type: string }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('id', String(Date.now() / 1000));
  try {
    const result = await axios({
      method: 'POST',
      url: `${BLENDER_BASE_URL}/fbx2glb-upload-api`,
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

export const uploadFileToMotionData = async ({
  start,
  end,
  fileName,
  id,
  type,
  url,
}: uploadFileToMotionDataProps) => {
  try {
    const formData = new FormData();
    const file = await fnConvertBloburlToFile({
      url,
      type,
      fileName,
    });
    formData.append('file', file);
    formData.append('type', type);
    formData.append('id', id);
    formData.append('start', start.toString());
    formData.append('end', end.toString());
    const result = await axios({
      method: 'POST',
      url: `${BASE_URL}/mocap-upload-api`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      result,
      error: false,
    };
  } catch (error) {
    return {
      error: true,
      msg: error,
    };
  }
};
