import { FILE_TYPES, MainDataTypes, MAINDATA_PROPERTY_TYPES } from 'types';
import _ from 'lodash';

interface fnFilterArrayByHierarchyProps {
  data: MainDataTypes[];
  searchWord: string;
}
export const fnFilterArrayByHierarchy = ({ data, searchWord }: fnFilterArrayByHierarchyProps) => {
  const fileKeys = _.map(
    _.filter(
      data,
      (item) => _.isEqual(item.type, FILE_TYPES.file) && _.includes(item.name, searchWord),
    ),
    (item) => item.key,
  );
  const result = _.filter(
    data,
    (item) => _.includes(fileKeys, item.key) || _.includes(fileKeys, item.parentKey),
  );
  return result;
};
