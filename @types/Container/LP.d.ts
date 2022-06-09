import { PlaskMocapData, PlaskRetargetMap, ServerAnimation, ServerAnimationLayer } from 'types/common';

export = LP;
export as namespace LP;

interface BaseNode {
  id: string;
  parentId;
  type: LP.NodeType;
  name: string;
}
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
    retargetMap?: Omit<PlaskRetargetMap, 'id' | 'assetId'>;
    animationId?: string;
    mocapId?: string;
  }

  interface DirectoryNode extends BaseNode {
    type: 'DIRECTORY';
    childNodeIds: string[];
  }

  interface ModelNode extends BaseNode {
    type: 'MODEL';
    assetId: string;
    modelUrl: string;
    childNodeIds: string[];
    extension: string;
    retargetMap: Omit<PlaskRetargetMap, 'id' | 'assetId'>;
  }

  interface MotionNode extends BaseNode {
    type: 'MOTION';
    assetId: string;
    animation: Animation;
  }

  interface MotionNode extends BaseNode {
    type: 'MOCAP';
    mocapData: PlaskMocapData;
  }
}

export default LP;
