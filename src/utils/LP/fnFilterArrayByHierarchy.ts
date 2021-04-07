import { FILE_TYPES, LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import _ from 'lodash';

interface fnFilterArrayByHierarchyProps {
  data: LPDataType[];
  searchWord: string;
}
interface addResultPrps {
  prevData: LPDataType[];
  newData: LPDataType[];
}
interface findAllChildsProps {
  data: LPDataType[];
  parentData: LPDataType;
}
const findAllChilds = ({ data, parentData }: findAllChildsProps) => {
  let result: LPDataType[] = [];
  let currentRows: LPDataType[] = [parentData];
  let additionalRows: LPDataType[] = [];
  do {
    additionalRows = [];
    _.forEach(currentRows, (item) => {
      const childRows = _.filter(data, [LPDATA_PROPERTY_TYPES.parentKey, item?.key]);
      if (childRows) {
        additionalRows = _.concat(additionalRows, childRows);
      }
    });
    currentRows = _.clone(additionalRows);
    if (!_.isEmpty(currentRows)) {
      result = _.concat(result, currentRows);
    }
  } while (!_.isEmpty(currentRows));
  return result;
};
const addResult = ({ prevData, newData }: addResultPrps) => {
  const result = _.clone(prevData);
  _.forEach(newData, (item) => {
    if (!_.some(result, [LPDATA_PROPERTY_TYPES.key, item?.key])) {
      result.push(item);
    }
  });
  return result;
};
export const fnFilterArrayByHierarchy = ({ data, searchWord }: fnFilterArrayByHierarchyProps) => {
  let result: LPDataType[] = [];
  const searchFiles = _.filter(data, (item) =>
    _.includes(item.name.toLowerCase(), searchWord.toLowerCase()),
  );
  _.forEach(searchFiles, (file) => {
    const childRows = findAllChilds({ data, parentData: file });
    if (childRows) {
      result = addResult({ prevData: result, newData: childRows });
    }
    let currentRow: LPDataType | undefined = _.clone(file);
    if (currentRow) {
      result = addResult({ prevData: result, newData: [currentRow] });
    }
    do {
      currentRow = _.find(data, [LPDATA_PROPERTY_TYPES.key, currentRow?.parentKey]);
      if (currentRow) {
        result = addResult({ prevData: result, newData: [currentRow] });
      }
    } while (!_.isUndefined(currentRow));
  });
  return result;
};
