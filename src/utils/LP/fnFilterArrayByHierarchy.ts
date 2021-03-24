import { FILE_TYPES, MainDataType } from 'types';
import _ from 'lodash';

interface fnFilterArrayByHierarchyProps {
  data: MainDataType[];
  searchWord: string;
}
export const fnFilterArrayByHierarchy = ({ data, searchWord }: fnFilterArrayByHierarchyProps) => {
  const fileKeys = _.map(
    _.filter(
      data,
      (item) =>
        _.isEqual(item.type, FILE_TYPES.file) &&
        _.includes(item.name.toLowerCase(), searchWord.toLowerCase()),
    ),
    (item) => item.key,
  );
  const result = _.filter(
    data,
    (item) => _.includes(fileKeys, item.key) || _.includes(fileKeys, item.parentKey),
  );
  return result;
};
