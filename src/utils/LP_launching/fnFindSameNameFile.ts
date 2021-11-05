import { LPItemListType, LPItemType } from 'types/LP';

interface FindSameNameFile {
  name: string;
  data: LPItemListType;
}

/**
 * 동일한 이름을 가진 파일을 찾아주는 함수입니다.
 *
 * @param name 파일이름
 * @param data lpdata
 *
 * @return 동일한 이름을 가진 파일
 */
const fnFindSameNameFile = (params: FindSameNameFile): LPItemType | undefined => {
  const { name, data } = params;
  const sameFileNameRow = data.find((item) => item.name === name);
  return sameFileNameRow;
};

export default fnFindSameNameFile;
