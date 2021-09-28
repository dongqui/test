import { MutableRefObject, InputHTMLAttributes, RefObject } from 'react';

export = LP;
export as namespace LP;

declare namespace LP {
  type View = 'List' | 'Gallery';
  type NodeType = 'Folder' | 'Model' | 'Motion';

  interface Node {
    id: string;
    fileURL?: string | File;
    filePath: string;
    name: string;
    type: NodeType;
  }
}

export default LP;
