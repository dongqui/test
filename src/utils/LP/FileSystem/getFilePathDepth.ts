export default function getFilePathDepth(nodes: LP.Node[], targetNode: LP.Node) {
  let count = 1;
  let node = targetNode;
  while (node.parentId) {
    count += 1;

    const parentNode = nodes.find((node) => node.id === targetNode.parentId);
    if (parentNode) {
      node = parentNode;
    } else {
      break;
    }
  }
  return count;
}
