import _ from 'lodash';
import { LPItemListType } from 'types/LP';

interface InsertDataAsChild {
  data: LPItemListType;
  targetData: LPItemListType;
  targetKey: string;
}

/**
 * 원하는 lpdata를 특정 row 하위에 추가해주는 함수입니다
 *
 * @param data 추가 전 lpdata
 * @param targetData 추가 할 lpdata
 * @param targetKey 하위에 넣을 row의 key
 *
 * @return 추가된 후의 lpdata
 */
const fnInsertDataAsChild = (params: InsertDataAsChild): LPItemListType => {
  const { data, targetData, targetKey } = params;
  let result = _.clone(data);
  let startIndex = _.findLastIndex(data, (item) => item.parentKeyList.includes(targetKey)); // 선택한 row 하위의 맨 마지막 다음부터 끼워넣는다
  startIndex = startIndex === -1 ? _.findIndex(data, (item) => item.key === targetKey) : startIndex; // 하위에 아무것도 없으면 선택한 row 바로 다음 index에 끼워넣는다
  result = _.concat(result.slice(0, startIndex + 1), targetData, result.slice(startIndex + 1));
  return result;
};

export default fnInsertDataAsChild;
