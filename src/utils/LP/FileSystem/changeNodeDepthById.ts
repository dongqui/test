import { find } from 'lodash';

const changeNodeDepthById = (immerDraftNodes: LP.Node[], childId: string, parentNode: LP.Node) => {
  const changeNode = find(immerDraftNodes, { id: childId });

  if (changeNode) {
    changeNode.filePath = parentNode.filePath + `\\${parentNode.name}`;

    if (changeNode.childrens.length > 0) {
      changeNode.childrens.forEach((child) => {
        changeNodeDepthById(immerDraftNodes, child, changeNode);
      });
    }
  }
};

export default changeNodeDepthById;
