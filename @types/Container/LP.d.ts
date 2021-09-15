import { MutableRefObject, InputHTMLAttributes, RefObject } from 'react';

export = LP;
export as namespace LP;

declare namespace LP {
  type View = 'List' | 'Gallery';
  type NodeType = 'Folder' | 'Model' | 'Motion';

  interface Node {
    id: string;
    fileURL: string | File;
    name: string;
    type: LP.NodeType;
  }
}

export default LP;
