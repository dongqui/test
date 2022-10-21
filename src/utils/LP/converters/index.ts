import { find } from 'lodash';

import { getFileExtension } from 'utils/common';
import { RequestNodeResponse } from 'types/LP';

export function convertServerResponseToNode(response: RequestNodeResponse): LP.Node {
  return {
    id: response.uid,
    assetId: response.assetsUid,
    parentId: response.parentUid,
    type: response.type,
    name: response.name,
    modelUrl: response.modelUrl || '',
    childNodeIds: [],
    extension: response.type === 'MODEL' ? getFileExtension(response.name) : '',
    mocapId: response.mocap,
    animationId: response.animationUid && response.animationUid[0],
    retargetMap: response.retargetMap,
    createdAt: response.createdAt,
  };
}

export function setChildNodeIds(nodes: LP.Node[]) {
  for (const node of nodes) {
    if (node.parentId) {
      const parentNode = find(nodes, { id: node.parentId });
      if (!parentNode?.childNodeIds.includes(node.id)) {
        parentNode?.childNodeIds.push(node.id);
      }
    }
  }

  return nodes;
}
