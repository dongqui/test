import axios from 'axios';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = 'https://shootapi.myplask.com:5000';
const BLENDER_BASE_URL = 'https://blenderapi.myplask.com:5000/';
interface fnApiProps {
  action: 'upload';
  payload: { data?: string; type?: 'glb' | 'fbx' };
}
export const fnApi = async ({ action, payload }: fnApiProps) => {
  let result;
  try {
    switch (action) {
      case 'upload':
        result = await axios({
          baseURL: BLENDER_BASE_URL,
          method: 'POST',
          url: `${payload.type === 'glb' ? '/glb2fbx-api' : '/fbx2glb-api'}`,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Accept: 'application/json',
          },
          data: {
            url: payload.data,
            type: payload.type,
            id: uuidv4(),
          },
          responseType: 'json',
        });
        break;
      default:
        break;
    }
  } catch (error) {
    return {
      result,
      error: true,
      msg: error,
    };
  }
  return {
    result,
    error: false,
  };
};
