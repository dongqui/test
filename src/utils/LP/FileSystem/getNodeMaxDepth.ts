import { max, find } from 'lodash';

const getNodeMaxDepth = (arr: string[], maximum: number, original: number[], nodes: LP.Node[]) => {
  arr.map((el) => {
    const element = find(nodes, { id: el });
    if (element) {
      const maxValue = maximum + 1;

      if (element.childNodeIds.length > 0) {
        getNodeMaxDepth(element.childNodeIds, maxValue, original, nodes);
      }

      // @TODO 6depth일때 무조건 return시켜서 빠르게 종료시켜야함
      if (element.childNodeIds.length === 0) {
        original.push(maxValue);
      }
    }
  });

  return max(original);
};
export default getNodeMaxDepth;
