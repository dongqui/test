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
    mocapData: response.mocap && response.mocap[0].trackData,
    animation: response.scenesLibraryModelAnimations && response.scenesLibraryModelAnimations[0],
    retargetMap: response.retargetMap,
  };
}
