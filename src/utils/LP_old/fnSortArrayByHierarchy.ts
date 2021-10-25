import { LPDATA_PROPERTY_TYPES } from 'types';
import { LPItemListOldType, ROOT_FOLDER_NAME } from 'types/LP';
import _ from 'lodash';

interface FnSortArrayByHierarchyProps {
  data: LPItemListOldType;
}
/**
 * lpData 를 계층순으로 정렬해준다.
 *
 * @param data - lpData
 *
 * @return 정렬 후 lpData
 */
const fnSortArrayByHierarchy = ({ data }: FnSortArrayByHierarchyProps) => {
  let tempData = _.clone(data);
  let result: LPItemListOldType = [];
  let newData: LPItemListOldType;
  let cnt = 0;
  do {
    cnt += 1;
    if (_.some(tempData, [LPDATA_PROPERTY_TYPES.parentKey, ROOT_FOLDER_NAME])) {
      newData = _.filter(tempData, [LPDATA_PROPERTY_TYPES.parentKey, ROOT_FOLDER_NAME]);
      result = _.concat(result, newData);
      tempData = _.filter(tempData, (item) => !_.isEqual(item.parentKey, ROOT_FOLDER_NAME));
      continue;
    }
    let tempResult: LPItemListOldType = [];
    _.forEach(result, (item) => {
      tempResult = _.concat(tempResult, item);
      const mustInclude =
        _.some(tempData, (o) => _.isEqual(o.parentKey, item.key)) &&
        !_.some(result, (o) => _.isEqual(o.parentKey, item.key));
      if (mustInclude) {
        tempResult = _.concat(
          tempResult,
          _.filter(tempData, (o) => _.isEqual(o.parentKey, item.key)),
        );
      }
    });
    result = _.clone(tempResult);
    if (_.gt(cnt, 20)) {
      break;
    }
  } while (!_.isEqual(_.size(data), _.size(result)));
  return result;
};
export default fnSortArrayByHierarchy;
