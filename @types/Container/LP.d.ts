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
    children: any[];
    extension: string;
    motionData?: {
      id: string;
      result: {
        name: string;
        times: number[];
        values: number[];
      }[];
    };
  }
}

export default LP;
