import { MainDataTypes, MAINDATA_PROPERTY_TYPES } from 'types';
import { MAIN_DATA } from 'lib/store';
import _ from 'lodash';

interface fnDeleteFileProps {
  mainData: MainDataTypes[];
  keys?: string[];
}

export const fnDeleteFile = ({ mainData }: fnDeleteFileProps) => {
  let keys = [_.find(mainData, [MAINDATA_PROPERTY_TYPES.isClicked, true])?.key];
  let tempData = _.clone(mainData);
  do {
    _.forEach(keys, (key) => {
      keys = _.concat(
        keys,
        _.map(_.filter(tempData, [MAINDATA_PROPERTY_TYPES.parentKey, key]), (item) => item.key),
      );
      tempData = _.filter(tempData, (item) => !_.includes(keys, item.key));
    });
  } while (_.some(tempData, (item) => _.includes(keys, item.parentKey)));
  MAIN_DATA(tempData);
};
export const fnDeleteFileByKeys = ({ keys = [], mainData }: fnDeleteFileProps) => {
  let tempData = _.clone(mainData);
  let tempKeys = _.clone(keys);
  do {
    _.forEach(tempKeys, (key) => {
      tempKeys = _.concat(
        tempKeys,
        _.map(_.filter(tempData, [MAINDATA_PROPERTY_TYPES.parentKey, key]), (item) => item.key),
      );
      tempData = _.filter(tempData, (item) => !_.includes(tempKeys, item.key));
    });
  } while (_.some(tempData, (item) => _.includes(tempKeys, item.parentKey)));
  return tempData;
};
