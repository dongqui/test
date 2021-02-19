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
export interface screenSizeTypes {
  width: number;
  height: number;
}
export enum FORMAT_TYPES {
  glb = 'glb',
  fbx = 'fbx',
  gltf = 'gltf',
}
export interface shortcutTypes {
  key: string;
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
  isModifying?: boolean;
}
export interface mainDataTypes {
  key: string;
  name: string;
  isChild: boolean;
  parentKey?: string;
  isExpanded?: boolean;
  url?: string;
}
