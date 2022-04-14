function createFolderNode(id: string, nodeName: string, filePath: string, parentId?: string): LP.Node {
  return {
    id,
    parentId: parentId || '',
    filePath: parentId ? filePath + `\\${nodeName}` : '',
    name: nodeName,
    extension: '',
    type: 'Folder',
    childNodeIds: [],
  };
}

export default createFolderNode;
