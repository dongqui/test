// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IpcRenderer } from 'electron';
import { BooleanValueNode } from 'graphql';
import { ContextmenuDataTypes } from '../components/Contextmenu';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      ipcRenderer: IpcRenderer;
    }
  }
}
export enum FORMAT_TYPES {
  glb = 'glb',
  fbx = 'fbx',
  gltf = 'gltf',
}
export enum PROPERTY_TYPES {
  position = 'position',
  positionCnt = 3,
  quaternion = 'quaternion',
  quaternionCnt = 4,
  rotation = 'rotation',
  rotationCnt = 3,
  scale = 'scale',
  scaleCnt = 3,
}
export interface screenSizeTypes {
  width: number;
  height: number;
}
export interface shortcutTypes {
  key: string;
  ctrlKey?: boolean;
  event: Function;
}
export interface contextmenuTypes {
  data?: ContextmenuDataTypes[];
  isShow: boolean;
  top: number;
  left: number;
  onClick: ({ key }: { key: string }) => void;
}
export interface mainDataTypes {
  key: string;
  name: string;
  isChild: boolean;
  parentKey?: string;
  isExpanded?: boolean;
  url?: string;
  isSelected?: boolean;
  isVisualized?: boolean;
  isModifying?: boolean;
  isCopied?: boolean;
  isDragging?: boolean;
}
export interface bonesTypes {
  name: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  quaternionW: number;
  quaternionX: number;
  quaternionY: number;
  quaternionZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}
export interface skeletonHelpersTypes {
  time?: string;
  bones?: bonesTypes[];
}
