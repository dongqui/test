import { PlaskMocapData } from 'types/common';

export = LP;
export as namespace LP;

declare namespace LP {
  type View = 'List' | 'Gallery';
  type NodeType = 'DIRECTORY' | 'MODEL' | 'MOTION' | 'MOCAP';

  interface Node {
    id: string;
    assetId?: string;
    parentId: string;
    type: NodeType;
    name: string;
    modelUrl?: string;
    childNodeIds: string[];
    extension: string;
    mocapData?: PlaskMocapData;
  }
}

export default LP;
