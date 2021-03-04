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
    isExpanded: true,
    visualizedMotionKey: '0',
    motions: [
      { key: '0', name: 'motion1', tracks: [] },
      { key: '1', name: 'motion2', tracks: [] },
      { key: '2', name: 'motion2', tracks: [] },
    ],
  },
  {
    key: '1',
    name: '기본모델1',
    isChild: true,
    parentKey: 'root',
    url: DEFAULT_MODEL_URL,
    isVisualized: false,
    isExpanded: true,
    visualizedMotionKey: '0',
    motions: [
      { key: '3', name: 'motion1', tracks: [] },
      { key: '4', name: 'motion2', tracks: [] },
      { key: '5', name: 'motion2', tracks: [] },
    ],
  },
];
