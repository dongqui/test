function createFolderNode(id: string, nodeName: string, parentId?: string): LP.Node {
  return {
    id,
    parentId: parentId || '',
    name: nodeName,
    extension: '',
    type: 'Folder',
    childNodeIds: [],
  };
}

export default createFolderNode;
