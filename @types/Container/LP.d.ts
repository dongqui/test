import { PlaskMocapData } from 'types/common';

export = LP;
export as namespace LP;

declare namespace LP {
  type View = 'List' | 'Gallery';
  type NodeType = 'Folder' | 'Model' | 'Motion';

  interface Node {
    id: string;
    assetId?: string;
    parentId: string;
    type: NodeType;
    name: string;
    fileUrl?: string | File;
    filePath: string;
    childrens: string[];
    extension: string;
    mocapData?: PlaskMocapData;
  }
}

export default LP;
