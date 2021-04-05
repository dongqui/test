import { FILE_TYPES, MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import _ from 'lodash';

interface fnFilterArrayByHierarchyProps {
  data: MainDataType[];
  searchWord: string;
}
export const fnFilterArrayByHierarchy = ({ data, searchWord }: fnFilterArrayByHierarchyProps) => {
  let result: MainDataType[] = [];
  const searchFiles = _.filter(
    data,
    (item) =>
      _.includes([FILE_TYPES.file, FILE_TYPES.motion], item.type) &&
      _.includes(item.name.toLowerCase(), searchWord.toLowerCase()),
  );
  _.forEach(searchFiles, (file) => {
    if (_.isEqual(file?.type, FILE_TYPES.file)) {
      const childRows = _.filter(data, (item) => _.isEqual(item?.parentKey, file?.key));
      if (childRows) {
        result = _.concat(result, childRows);
      }
    }
    let currentRow: MainDataType | undefined = _.clone(file);
    result = _.concat(result, currentRow);
    do {
      currentRow = _.find(data, [MAINDATA_PROPERTY_TYPES.key, currentRow?.parentKey]);
      if (currentRow) {
        result = _.concat(result, currentRow);
      }
    } while (!_.isUndefined(currentRow));
  });
  return result;
};
