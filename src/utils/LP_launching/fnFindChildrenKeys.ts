import _ from 'lodash';
import { LPItemListType } from 'types/LP';

interface FindDeleteKeys {
  data: LPItemListType;
  keys: string[];
}

/**
 * 전달받은 key들의 하위키들을 모두 찾아줍니다.
 *
 * @param data - lpdata
 * @param keys - 상위 키들
 *
 * @return 하위 키들의 배열
 */
const fnFindChildrenKeys = (params: FindDeleteKeys): string[] => {
  const { data, keys } = params;
  // 전달받은 키들을 부모로 가지고 있는 모든 하위 row들
  const childrenRows = data.filter((item) => !_.isEmpty(_.intersection(item.parentKeyList, keys)));
  // 해당 row들의 key들
  let childrenKeys = childrenRows.map((item) => item.key);
  // 중복 키 제거
  childrenKeys = _.uniq(childrenKeys);
  return childrenKeys;
};

export default fnFindChildrenKeys;
