import _ from 'lodash';

export default function getDescendantNodes(nodes: LP.Node[], targetNodeId: string): LP.Node[] {
  const targetNode = _.find(nodes, { id: targetNodeId });

  if (!targetNode) {
    return [];
  }

  const childrens: LP.Node[] = [];
  const stack = [targetNode];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur) {
      break;
    }

    for (const childId of cur?.childNodeIds) {
      const child = _.find(nodes, { id: childId });
      if (child) {
        childrens.push(child);
        stack.push(child);
      }
    }
  }

  return childrens;
}
