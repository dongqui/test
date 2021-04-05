import { LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import _ from 'lodash';

interface fnSortArrayByHierarchyProps {
  data: LPDataType[];
}
export const fnSortArrayByHierarchy = ({ data }: fnSortArrayByHierarchyProps) => {
  let tempData = _.clone(data);
  let result: LPDataType[] = [];
  let newData: LPDataType[];
  let cnt = 0;
  do {
    cnt += 1;
    if (_.some(tempData, [LPDATA_PROPERTY_TYPES.parentKey, ROOT_FOLDER_NAME])) {
      newData = _.filter(tempData, [LPDATA_PROPERTY_TYPES.parentKey, ROOT_FOLDER_NAME]);
      result = _.concat(result, newData);
      tempData = _.filter(tempData, (item) => !_.isEqual(item.parentKey, ROOT_FOLDER_NAME));
      continue;
    }
    let tempResult: LPDataType[] = [];
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
