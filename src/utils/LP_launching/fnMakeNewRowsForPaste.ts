import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { LPItemListType, LPItemType, ROOT_KEY } from 'types/LP';
import { fnChangeFileNameCheckingDuplicate, fnFindChildrenKeys, fnFindTopParentRows } from '.';

interface MakeNewRowsForPaste {
  data: LPItemListType;
  rows: LPItemListType;
  targetRow?: LPItemType;
  type: 'paste' | 'move';
}

/**
 * 붙여넣기 할 대상 하위에 넣어주기 위한 rows 를 만들어주는 함수
 * 붙여넣기 뿐만 아니라 파일 이동시에도 재활용이 되서 함수로 분리
 *
 * @param data - lpdata
 * @param rows - 복사할 rows
 * @param targetRow - 붙여넣기 할 대상이 되는 row
 * @param type - paste: 붙여넣기의 용도, move: 이동의 용도
 *
 * @return 새로 생성된 rows
 */
const fnMakeNewRowsForPaste = (params: MakeNewRowsForPaste): LPItemListType => {
  const { data, rows, targetRow, type } = params;

  let copiedRows: LPItemListType = _.clone(rows);
  const topParentKeys = fnFindTopParentRows({ data: rows }).map((item) => item.key);
  copiedRows = copiedRows.map((item) => {
    const newGroupKey = topParentKeys.find(
      (parentKey) => parentKey === item.key || item.parentKeyList.includes(parentKey),
    );
    return { ...item, groupKey: newGroupKey ? newGroupKey : item.groupKey };
  }); // 그룹키를 다시 만들어준다.
  const groupKey: keyof LPItemType = 'groupKey';
  const copiedGroupKeys = Object.keys(_.groupBy(copiedRows, groupKey)); // 복사한 row들을 그룹별로 나눈다
  let newCopiedRows: LPItemListType = [];
  let uuid = uuidv4();
  if (type === 'move') {
    // 붙여넣기가 아닌 이동을 위한 목적라면 키를 변경하지 않는다
    uuid = '';
  }
  _.forEach(copiedGroupKeys, (groupKey) => {
    const groupRows = copiedRows.filter((item) => item.groupKey == groupKey); // 현재 그룹의 row들
    const topDepth = _.min(groupRows.map((item) => item.depth)) || 1; // 현재 그룹중 최상위 depth
    const topDepthRow = groupRows.find((item) => item.depth === topDepth);
    if (topDepthRow) {
      const newKey = `${topDepthRow.key}${uuid}`; // 새로운 키를 생성한다
      const newGroupKey = targetRow ? targetRow.groupKey : uuidv4(); // 선택폴더 하위로 들어갈땐 선택폴더의 groupKey를 따른다
      const newDepth = targetRow ? targetRow.depth + 1 : 1; // 선택한 폴더가 있으면 해당 폴더의 하위로 들어가야 한다
      const newParentKey = targetRow ? targetRow.key : ROOT_KEY;
      const newParentKeyList = targetRow ? [...targetRow.parentKeyList, targetRow.key] : [ROOT_KEY];
      const currentRows = data.filter((item) => item.parentKey === newParentKey); // 같은 depth에 있는 row들
      const newTopDepthRow = {
        ...topDepthRow,
        key: newKey,
        name: fnChangeFileNameCheckingDuplicate({
          data: currentRows,
          name: topDepthRow?.name ?? '',
        }), // 그룹의 최상위 depth는 이름중복체크를 해준다.
        depth: newDepth,
        groupKey: newGroupKey,
        parentKey: newParentKey,
        parentKeyList: newParentKeyList,
      };
      newCopiedRows.push(newTopDepthRow);
      const childrenKeys = fnFindChildrenKeys({ data, keys: [topDepthRow.key] });
      const childrenRows = data
        .filter((item) => childrenKeys.includes(item.key))
        .map((item) => ({
          ...item,
          key: `${item.key}${uuid}`,
          depth: item.depth + (newDepth - topDepth), // 변경된 depth만큼 재조정해준다
          groupKey: newGroupKey,
          parentKey: `${item.parentKey}${uuid}`,
          parentKeyList: [
            ...newParentKeyList,
            ...item.parentKeyList
              .filter((item) => !topDepthRow.parentKeyList.includes(item))
              .map((item) => `${item}${uuid}`),
          ], // 최상위 depth row의 하위부터 key를 변경해준다
        }));
      newCopiedRows = _.concat(newCopiedRows, childrenRows); // 재조정한 하위 row들도 모두 담아준다
    }
  });
  return newCopiedRows;
};

export default fnMakeNewRowsForPaste;
