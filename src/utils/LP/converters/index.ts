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
