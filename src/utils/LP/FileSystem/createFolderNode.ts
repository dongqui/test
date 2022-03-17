import { v4 as uuid } from 'uuid';

function createFolderNode(nodeName: string, filePath: string, parentId?: string): LP.Node {
  return {
    id: uuid(),
    parentId: parentId || '__root__',
    filePath: parentId ? filePath + `\\${nodeName}` : '\\root',
    name: nodeName,
    extension,
    type: 'Folder',
    childNodeIds: [],
  };
}

export default createFolderNode;
