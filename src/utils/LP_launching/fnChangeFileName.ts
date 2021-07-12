import clone from 'lodash/clone';
import { LPItemListType } from 'types/LP';

interface ChangeFileName {
  data: LPItemListType;
  name: string;
}

/**
 * 이름 중복체크 후의 파일이름을 만들어주는 함수입니다
 *
 * @param data - lpdata
 * @param name - 파일이름
 *
 * @return 변경된 파일이름
 */
const fnChangeFileNameCheckingDuplicate = (params: ChangeFileName): string => {
  const { data, name } = params;
  const sameNameCnt = data.filter((item) => item.name.includes(name)).length; // 동일한 파일이름의 개수
  let newName = clone(name);
  if (sameNameCnt > 0) {
    newName += ` (${sameNameCnt + 1})`;
  }
  return newName;
};

export default fnChangeFileNameCheckingDuplicate;
