import { getBinarySearch } from './index';

const findElementIndex = <L>(collection: L[], element: number, key?: keyof L) => {
  const trackIndex = getBinarySearch<L>({ collection, index: element, key });
  return trackIndex;
};

export default findElementIndex;
