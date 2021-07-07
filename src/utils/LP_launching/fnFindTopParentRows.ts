import { LPItemListType } from 'types/LP';

interface FnFindTopParentRows {
  data: LPItemListType;
}

/**
 * 가장 상위 depth의 row들만 추려주는 함수입니다.
 *
 * @param data lpdata
 *
 * @return 추린 후의 lpdata
 */
const fnFindTopParentRows = (params: FnFindTopParentRows): LPItemListType => {
  const { data } = params;

  const keys = data.map((item) => item.key);
  const topParentRows = data.filter((item) => !keys.includes(item.parentKey));
  return topParentRows;
};

export default fnFindTopParentRows;
