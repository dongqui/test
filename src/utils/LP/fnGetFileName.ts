import _ from 'lodash';
import { LPDataType } from 'types';

interface fnGetFileNameProps {
  key: string;
  name: string;
  mainData: LPDataType[];
}

export const fnGetFileName = ({ key, name, mainData }: fnGetFileNameProps) => {
  const filteredMainData = _.filter(mainData, (item) => !_.isEqual(item.key, key));
  if (_.some(filteredMainData, (item) => _.isEqual(item.name, name))) {
    return `${name} (${
      _.size(_.filter(filteredMainData, (item) => _.includes(item.name, name))) + 1
    })`;
  } else {
    return name;
  }
};
