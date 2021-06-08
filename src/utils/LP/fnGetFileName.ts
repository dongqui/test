import _ from 'lodash';
import { LPDATA_PROPERTY_TYPES } from 'types';
import { LPItemListOldType } from 'types/LP';

interface FnGetFileNameProps {
  key: string;
  name: string;
  lpData: LPItemListOldType;
  parentKey?: string;
}
/**
 * 이름 중복체크를 한 후의 파일이름을 반환받는다
 *
 * @param key - key값
 * @param name - 파일이름
 * @param lpData - lpData
 * @param parentKey - parentKey
 *
 * @return 중복체크 후 파일이름
 */
const fnGetFileName = ({ key, name, lpData, parentKey }: FnGetFileNameProps) => {
  let filteredLpData = _.filter(lpData, (item) => !_.isEqual(item.key, key));
  if (parentKey) {
    filteredLpData = _.filter(lpData, [LPDATA_PROPERTY_TYPES.parentKey, parentKey]);
  }
  if (_.some(filteredLpData, (item) => _.isEqual(item.name, name))) {
    return `${name} (${
      _.size(_.filter(filteredLpData, (item) => _.includes(item.name, name))) + 1
    })`;
  } else {
    return name;
  }
};
export default fnGetFileName;
