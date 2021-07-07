import { v4 as uuidv4 } from 'uuid';
import { LPItemListType, LPItemType, ROOT_KEY } from 'types/LP';

interface FnMakeNewData
  extends Pick<
    LPItemType,
    'key' | 'name' | 'type' | 'parentKey' | 'boneNames' | 'baseLayer' | 'url'
  > {
  data: LPItemListType;
}

/**
 * 새로운 lpdata 를 생성할때 필요한 값들을 만들어 주는 함수입니다.
 *
 * @param key - 새 데이터의 key
 * @param name - 새 데이터의 이름
 * @param type - 새 데이터의 타입
 * @param parentKey - 부모키
 * @param boneNames - boneNames
 * @param baseLayer - baseLayer
 * @param url - 파일 url
 * @param data - lpData
 *
 * @return 추가할 새로운 lpdata
 */

const fnMakeNewData = (props: FnMakeNewData): LPItemType => {
  const { key, name, type, data, parentKey, boneNames, baseLayer, url } = props;

  const parentRow = data.find((item) => item.key === parentKey); // 부모 row
  const newParentKey = parentRow ? parentRow.key : ROOT_KEY;
  const newParentKeyList = parentRow ? [...parentRow.parentKeyList, newParentKey] : [ROOT_KEY];
  const newDepth = parentRow ? parentRow.depth + 1 : 1;
  const newGroupKey = parentRow ? parentRow.groupKey : uuidv4();
  const newLPItem: LPItemType = {
    key,
    name,
    type,
    baseLayer,
    boneNames,
    layers: [],
    url,
    parentKey: newParentKey,
    parentKeyList: newParentKeyList,
    depth: newDepth,
    groupKey: newGroupKey,
  };
  return newLPItem;
};

export default fnMakeNewData;
