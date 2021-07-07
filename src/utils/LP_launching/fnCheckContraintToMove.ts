import { LPItemListType, LPItemType } from 'types/LP';
import { fnFindTopParentRows } from '.';

interface FnCheckContraint {
  startRows: LPItemListType;
  destinationRow: LPItemType;
}

/**
 * 파일이동시 제약조건을 체크해주는 함수입니다
 *
 * @param startRows - 이동하고자 하는 lpdata
 * @param destinationRow - 목적지에 해당하는 row
 *
 * @return 이동 가능 여부
 */
const fnCheckContraintToMove = (params: FnCheckContraint): boolean => {
  const { startRows, destinationRow } = params;

  const selectedTopParentRows = fnFindTopParentRows({ data: startRows }); // 선택한 row들중 가장 상위에 있는 row들만 추려낸다
  const selectedRowsTypes = selectedTopParentRows.map((item) => item.type);
  // 제약조건 적용
  if (selectedRowsTypes.includes('Motion')) {
    return false;
  }
  if (selectedRowsTypes.includes('File')) {
    if (destinationRow?.type !== 'Folder') {
      return false;
    }
  }
  if (selectedRowsTypes.includes('Folder')) {
    if (destinationRow?.type !== 'Folder') {
      return false;
    }
  }
  return true;
};

export default fnCheckContraintToMove;
