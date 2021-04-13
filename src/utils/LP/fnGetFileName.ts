import _ from 'lodash';
import { LPDataType, LPDATA_PROPERTY_TYPES } from 'types';

interface fnGetFileNameProps {
  key: string;
  name: string;
  mainData: LPDataType[];
  parentKey?: string;
}

export const fnGetFileName = ({ key, name, mainData, parentKey }: fnGetFileNameProps) => {
  let filteredMainData = _.filter(mainData, (item) => !_.isEqual(item.key, key));
  if (parentKey) {
    filteredMainData = _.filter(mainData, [LPDATA_PROPERTY_TYPES.parentKey, parentKey]);
  }
  if (_.some(filteredMainData, (item) => _.isEqual(item.name, name))) {
    return `${name} (${
      _.size(_.filter(filteredMainData, (item) => _.includes(item.name, name))) + 1
    })`;
  } else {
    return name;
  }
};
