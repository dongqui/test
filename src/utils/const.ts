import { FILE_TYPES, MainDataTypes } from 'interfaces';
import { ROOT_FOLDER_NAME } from 'interfaces/LP';

export const isClient = typeof window !== 'undefined';
export const DEFAULT_MODEL_URL = 'https://assets.babylonjs.com/meshes/HVGirl.glb';
export const CUT_IMAGES_CNT = 20;
export const STANDARD_TIME_UNIT = 1 / 30;
export const INITIAL_MAIN_DATA: MainDataTypes[] = [
  {
    key: '0',
    name: 'model.glb',
    type: FILE_TYPES.file,
    parentKey: ROOT_FOLDER_NAME,
    url: DEFAULT_MODEL_URL,
    isExpanded: true,
  },
  {
    key: 'motion1',
    name: 'motion1',
    type: FILE_TYPES.motion,
    parentKey: '0',
    baseLayer: [],
  },
  {
    key: 'motion2',
    name: 'motion2',
    type: FILE_TYPES.motion,
    parentKey: '0',
    isVisualized: true,
    baseLayer: [],
  },
  {
    key: 'motion3',
    name: 'motion3',
    type: FILE_TYPES.motion,
    parentKey: '0',
    baseLayer: [],
  },
];
