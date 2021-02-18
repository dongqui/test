import { mainDataTypes } from 'interfaces';

export const isClient = typeof window !== 'undefined';
export const INITIAL_MAIN_DATA: mainDataTypes[] = [
  {
    key: '0',
    name: '모델0',
    isChild: true,
    parentKey: 'root',
    url: 'https://assets.babylonjs.com/meshes/HVGirl.glb',
  },
  {
    key: '1',
    name: '모델1',
    isChild: true,
    parentKey: 'root',
    url: 'https://assets.babylonjs.com/meshes/HVGirl.glb',
  },
  {
    key: '2',
    name: '모델2',
    isChild: true,
    parentKey: 'root',
    url: 'https://assets.babylonjs.com/meshes/HVGirl.glb',
  },
  {
    key: '3',
    name: '모델3',
    isChild: true,
    parentKey: 'root',
    url: 'https://assets.babylonjs.com/meshes/HVGirl.glb',
  },
  {
    key: '4',
    name: '폴더4',
    isChild: false,
    parentKey: 'root',
    isExpanded: false,
  },
  {
    key: '4-0',
    name: '모델4-0',
    isChild: true,
    parentKey: '4',
    url: 'https://assets.babylonjs.com/meshes/HVGirl.glb',
  },
  {
    key: '4-1',
    name: '모델4-1',
    isChild: true,
    parentKey: '4',
    url: 'https://assets.babylonjs.com/meshes/HVGirl.glb',
  },
  {
    key: '4-2',
    name: '모델4-2',
    isChild: true,
    parentKey: '4',
    url: 'https://assets.babylonjs.com/meshes/HVGirl.glb',
  },
];
