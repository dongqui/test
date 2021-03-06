import { FILE_TYPES, mainDataTypes } from 'interfaces';
import { ROOT_FOLDER_NAME } from 'interfaces/LP';

export const isClient = typeof window !== 'undefined';
export const DEFAULT_MODEL_URL = 'https://assets.babylonjs.com/meshes/HVGirl.glb';
export const INITIAL_MAIN_DATA: mainDataTypes[] = [
  {
    key: '0',
    name: '기본모델',
    type: FILE_TYPES.file,
    parentKey: ROOT_FOLDER_NAME,
    url: DEFAULT_MODEL_URL,
    isExpanded: true,
  },
  {
    key: 'motion1',
    motionIndex: 0,
    name: 'motion1',
    type: FILE_TYPES.motion,
    parentKey: '0',
    tracks: [],
  },
  {
    key: 'motion2',
    motionIndex: 1,
    name: 'motion2',
    type: FILE_TYPES.motion,
    parentKey: '0',
    isVisualized: true,
    tracks: [],
  },
  {
    key: 'motion3',
    motionIndex: 2,
    name: 'motion3',
    type: FILE_TYPES.motion,
    parentKey: '0',
    tracks: [],
  },
  {
    key: 'abcd',
    name: '폴더1',
    type: FILE_TYPES.folder,
    parentKey: ROOT_FOLDER_NAME,
  },
  {
    key: 'motion4',
    motionIndex: 1,
    name: 'motion4',
    type: FILE_TYPES.motion,
    parentKey: '1',
    tracks: [],
  },
  {
    key: 'motion5',
    motionIndex: 2,
    name: 'motion5',
    type: FILE_TYPES.motion,
    parentKey: '1',
    tracks: [],
  },
  {
    key: '1',
    name: '기본모델1',
    type: FILE_TYPES.file,
    parentKey: 'abcd',
    url: DEFAULT_MODEL_URL,
    isExpanded: true,
  },
];
