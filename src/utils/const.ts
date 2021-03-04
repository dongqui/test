import { FILE_TYPES, mainDataTypes } from 'interfaces';

export const isClient = typeof window !== 'undefined';
export const DEFAULT_MODEL_URL = 'https://assets.babylonjs.com/meshes/HVGirl.glb';
export const INITIAL_MAIN_DATA: mainDataTypes[] = [
  {
    key: '0',
    name: '기본모델',
    type: FILE_TYPES.file,
    parentKey: 'root',
    url: DEFAULT_MODEL_URL,
    isVisualized: true,
    isExpanded: true,
  },
  {
    key: 'motion1',
    name: 'motion1',
    type: FILE_TYPES.motion,
    parentKey: '0',
    tracks: [],
    isVisualized: true,
  },
  {
    key: 'motion2',
    name: 'motion2',
    type: FILE_TYPES.motion,
    parentKey: '0',
    tracks: [],
  },
  {
    key: 'motion3',
    name: 'motion3',
    type: FILE_TYPES.motion,
    parentKey: '0',
    tracks: [],
  },
  {
    key: '1',
    name: '기본모델1',
    type: FILE_TYPES.file,
    parentKey: 'root',
    url: DEFAULT_MODEL_URL,
    isExpanded: true,
  },
  {
    key: 'motion4',
    name: 'motion4',
    type: FILE_TYPES.motion,
    parentKey: '1',
    tracks: [],
  },
  {
    key: 'motion5',
    name: 'motion5',
    type: FILE_TYPES.motion,
    parentKey: '1',
    tracks: [],
  },
  {
    key: 'motion6',
    name: 'motion6',
    type: FILE_TYPES.motion,
    parentKey: '1',
    tracks: [],
  },
];
