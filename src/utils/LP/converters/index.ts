import { getFileExtension } from 'utils/common';
import { RequestNodeResponse } from 'types/LP';

// function convertNodeType(typeFromServer: 'DIRECTORY' | 'MOCAP' | 'MODEL'): LP.NodeType {
//   if (typeFromServer === 'DIRECTORY') {
//     return 'Folder';
//   } else if (typeFromServer === 'MOCAP') {
//     return 'Mocap';
//   } else if (typeFromServer === 'MODEL') {
//     return 'Model';
//   } else {
//     return 'Motion';
//   }
// }

export function convertServerResponseToNode(response: RequestNodeResponse): LP.Node {
  return {
    id: response.uid,
    assetId: response.assetsUid,
    parentId: response.parentUid,
    type: response.type,
    name: response.name,
    fileUrl: response.modelUrl,
    childNodeIds: [],
    extension: response.type === 'MODEL' ? getFileExtension(response.name) : '',
    mocapData: undefined,
  };
}
