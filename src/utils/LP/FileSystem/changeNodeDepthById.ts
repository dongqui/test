import { find } from 'lodash';

const changeNodeDepthById = (immerDraftNodes: LP.Node[], childId: string, parentNode: LP.Node) => {
  const changeNode = find(immerDraftNodes, { id: childId });

  if (changeNode) {
    if (changeNode.childNodeIds.length > 0) {
      changeNode.childNodeIds.forEach((child) => {
        changeNodeDepthById(immerDraftNodes, child, changeNode);
      });
    }
  }
};

export default changeNodeDepthById;
