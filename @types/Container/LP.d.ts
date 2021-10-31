import { MutableRefObject, InputHTMLAttributes, RefObject } from 'react';

export = LP;
export as namespace LP;

declare namespace LP {
  type View = 'List' | 'Gallery';
  type NodeType = 'Folder' | 'Model' | 'Motion';

  interface Node {
    id: string;
    parentId: string;
    fileURL?: string | File;
    filePath: string;
    name: string;
    extension: string;
    type: NodeType;
    hideNode?: boolean;
    children: any[];
    assetId?: string;
  }
}

export default LP;
