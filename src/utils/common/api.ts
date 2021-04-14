import axios from 'axios';
import { ShootTrackType, VIDEO_FORMAT_TYPES } from 'types';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { fnConvertBloburlToFile } from './fnConvertBloburlToFile';

const BASE_URL = 'https://shootapi.myplask.com:6500';
const RETARGETIING_URL = 'https://shootapi.myplask.com:6500';
const BLENDER_BASE_URL = 'https://blenderapi.myplask.com:6500';

interface uploadFileToMotionDataProps {
  type: VIDEO_FORMAT_TYPES | string;
  url: string;
  id: string;
  start: number;
  end: number;
  fileName: string;
}
interface getRetargetMapProps {
  bones: THREE.Bone[];
}
interface getRetargetBaseLayerProps {
  baseLayer: ShootTrackType[];
  name: string;
  retargetMap: Array<any>;
  isFbx: boolean;
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

interface SetConvertGlbToFbx {
  file: File;
  type: string;
  id: string;
}

export const setConvertGlbToFbx = async (props: SetConvertGlbToFbx) => {
  const { file, type, id } = props;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('id', id);
  const result = await axios({
    method: 'POST',
    url: `${BLENDER_BASE_URL}/glb2fbx-upload-api`,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
    .then((res) => res.data.result)
    .catch((err) => err);
  return result;
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

export const getRetargetMap = async ({ bones }: getRetargetMapProps) => {
  try {
    const result = await axios({
      method: 'POST',
      url: `${RETARGETIING_URL}/retargeting-mapper`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
      },
      data: {
        bones,
      },
      responseType: 'json',
    });
    return {
      result,
      error: false,
    };
  } catch (error) {
    console.log('error', error);
    return {
      error: true,
      msg: error,
    };
  }
};

export const getRetargetBaseLayer = async ({
  baseLayer,
  name,
  retargetMap,
  isFbx,
}: getRetargetBaseLayerProps) => {
  try {
    const formData = new FormData();
    formData.append('isFbx', `${isFbx}`);
    formData.append('sourceMotion', JSON.stringify({ name, tracks: baseLayer }));
    formData.append('retargetMap', JSON.stringify(retargetMap));
    const result = await axios({
      method: 'POST',
      url: `${RETARGETIING_URL}/retargeting-everyframe`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return {
      result,
      error: false,
    };
  } catch (error) {
    console.log('error', error);
    return {
      error: true,
      msg: error,
    };
  }
};
