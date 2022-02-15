import produce from 'immer';
import { find } from 'lodash';

const filterDeletedNodeAndChildren = (node: LP.Node[], ids: string[]) => {
  let memory: LP.Node[] = [];

  let afterNodes = node.filter((current) => !ids.includes(current.id));

  if (ids.length > 0) {
    ids.forEach((currentId) => {
      const searchedNode = find(node, { id: currentId });

      if (searchedNode) {
        searchedNode.childNodeIds.forEach((child) => {
          afterNodes = afterNodes.filter((current) => !searchedNode.childNodeIds.includes(current.id));

          memory = filterDeletedNodeAndChildren(afterNodes, [child]);
        });
      }

      memory = afterNodes;
    });
    return memory;
  } else {
    return node;
  }
};

function filterDeletedNode(nodes: LP.Node[], nodeId: string, parentId?: string) {
  const withoutDeletedNodeAndChildren = filterDeletedNodeAndChildren(nodes, [nodeId]);
  const afterFilteredFromParentNode = produce(withoutDeletedNodeAndChildren, (draft) => {
    const parentNode = find(draft, { id: parentId });
    if (parentNode) {
      parentNode.childNodeIds = parentNode.childNodeIds.filter((currentId) => currentId !== nodeId);
    }
  });

  return afterFilteredFromParentNode;
}

export default filterDeletedNode;
