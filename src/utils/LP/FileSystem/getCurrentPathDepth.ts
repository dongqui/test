export default function getCurrentPathDepth(node: LP.Node, count = 1): number {
  if (node.parentId === '') {
    return count;
  }
  return getCurrentPathDepth(node, count + 1);
}
