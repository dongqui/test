interface FnGetBinarySearch {
  collection: any[];
  index: number;
  key: string;
}

/**
 * dope sheet의 tarck index가 증가수열이라는 특성. find와 findIndex의 속도 개선을 위해,
 * lodash를 사용하지 않고 이진 탐색으로 track index를 찾는 함수입니다.
 *
 * @param collection - 이진 탐색을 적용시킬 1차원 리스트
 * @param index - 찾고자 하는 index
 * @param key - 찾고자 하는 key
 *
 * @returns 이진 탐색 index
 */
const fnGetBinarySearch = ({ collection, index, key }: FnGetBinarySearch) => {
  const size = collection.length;
  let left = 0;
  let right = size - 1;
  let targetIndex = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (collection[mid][key] === index) {
      targetIndex = mid;
      break;
    } else if (collection[mid][key] > index) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return targetIndex;
};

export default fnGetBinarySearch;
