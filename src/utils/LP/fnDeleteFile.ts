import { LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { storeLpData } from 'lib/store';
import _ from 'lodash';

interface FnDeleteFileProps {
  lpData: LPDataType[];
  keys?: string[];
}
/**
 * 파일삭제 (하위파일들도 모두 삭제)
 *
 * @param lpData - lpData
 *
 */
export const fnDeleteFile = ({ lpData }: FnDeleteFileProps) => {
  let keys = [_.find(lpData, [LPDATA_PROPERTY_TYPES.isClicked, true])?.key];
  let tempData = _.clone(lpData);
  do {
    _.forEach(keys, (key) => {
      keys = _.concat(
        keys,
        _.map(_.filter(tempData, [LPDATA_PROPERTY_TYPES.parentKey, key]), (item) => item.key),
      );
      tempData = _.filter(tempData, (item) => !_.includes(keys, item.key));
    });
  } while (_.some(tempData, (item) => _.includes(keys, item.parentKey)));
  storeLpData(tempData);
};
/**
 * 파일삭제 (키 값들을 통해 삭제)
 *
 * @param keys - 키값 배열
 * @param lpData - lpData
 *
 * @return 삭제 후 lpData
 */
export const fnDeleteFileByKeys = ({ keys = [], lpData }: FnDeleteFileProps) => {
  let tempData = _.clone(lpData);
  let tempKeys = _.clone(keys);
  do {
    _.forEach(tempKeys, (key) => {
      tempKeys = _.concat(
        tempKeys,
        _.map(_.filter(tempData, [LPDATA_PROPERTY_TYPES.parentKey, key]), (item) => item.key),
      );
      tempData = _.filter(tempData, (item) => !_.includes(tempKeys, item.key));
    });
  } while (_.some(tempData, (item) => _.includes(tempKeys, item.parentKey)));
  return tempData;
};
