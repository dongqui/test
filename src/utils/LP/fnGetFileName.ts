import _ from 'lodash';
import { MainDataTypes, MAINDATA_PROPERTY_TYPES } from 'types';

interface fnGetFileNameProps {
  key: string;
  name: string;
  mainData: MainDataTypes[];
}

export const fnGetFileName = ({ key, name, mainData }: fnGetFileNameProps) => {
  const filteredMainData = _.filter(mainData, (item) => !_.isEqual(item.key, key));
  console.log('name', name);
  console.log(
    'test',
    _.some(filteredMainData, (item) => _.isEqual(item.name, name)),
  );
  if (_.some(filteredMainData, (item) => _.isEqual(item.name, name))) {
    return `${name} (${
      _.size(_.filter(filteredMainData, (item) => _.includes(item.name, name))) + 1
    })`;
  } else {
    return name;
  }
};
