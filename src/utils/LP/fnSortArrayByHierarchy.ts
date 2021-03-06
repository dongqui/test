import { mainDataTypes, MAINDATA_PROPERTY_TYPES } from 'interfaces';
import { ROOT_FOLDER_NAME } from 'interfaces/LP';
import _ from 'lodash';

interface fnSortArrayByHierarchyProps {
  data: mainDataTypes[];
}
export const fnSortArrayByHierarchy = ({ data }: fnSortArrayByHierarchyProps) => {
  let tempData = _.clone(data);
  let result: mainDataTypes[] = [];
  let newData: mainDataTypes[];
  do {
    if (_.some(tempData, [MAINDATA_PROPERTY_TYPES.parentKey, ROOT_FOLDER_NAME])) {
      newData = _.filter(tempData, [MAINDATA_PROPERTY_TYPES.parentKey, ROOT_FOLDER_NAME]);
      result = _.concat(result, newData);
      tempData = _.filter(tempData, (item) => !_.isEqual(item.parentKey, ROOT_FOLDER_NAME));
      continue;
    }
    let tempResult: mainDataTypes[] = [];
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
  } while (!_.isEqual(_.size(data), _.size(result)));
  return result;
};
