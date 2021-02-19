import { mainDataTypes } from 'interfaces';

export const isClient = typeof window !== 'undefined';
export const DEFAULT_MODEL_URL = 'https://assets.babylonjs.com/meshes/HVGirl.glb';
export const INITIAL_MAIN_DATA: mainDataTypes[] = [
  {
    key: '0',
    name: '기본모델',
    isChild: true,
    parentKey: 'root',
    url: DEFAULT_MODEL_URL,
    isVisualized: true,
  },
];
