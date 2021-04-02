import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { fnGetFileName } from './fnGetFileName';

interface fnDeleteFileProps {
  mainData: MainDataType[];
}

export const fnPasteFile = ({ mainData }: fnDeleteFileProps) => {
  let result = _.clone(mainData);
  let additionalData: MainDataType[] = [];
  let key = '';
  if (!_.some(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])) {
    return result;
  }
  const copiedRow: MainDataType | undefined = _.find(mainData, [
    MAINDATA_PROPERTY_TYPES.isCopied,
    true,
  ]);
  const pasteRowsCnt = _.size(_.filter(mainData, (item) => _.includes(item?.key, copiedRow?.key)));
  let currentDepthRows = [];
  let childRows = [];
  key = uuidv4();
  if (copiedRow) {
    additionalData.push(copiedRow);
    result = _.concat(
      result,
      _.map(additionalData, (item) => ({
        ...item,
        key: `${item?.key}${pasteRowsCnt}`,
        name: fnGetFileName({
          key: '',
          name: _.find(mainData, [MAINDATA_PROPERTY_TYPES.isCopied, true])?.name ?? '',
          mainData,
        }),
        parentKey: _.isEqual(item?.parentKey, ROOT_FOLDER_NAME)
          ? item?.parentKey
          : `${item?.parentKey}${pasteRowsCnt}`,
      })),
    );
  }
  do {
    currentDepthRows = additionalData;
    additionalData = [];
    _.forEach(currentDepthRows, (item) => {
      childRows = _.filter(result, [MAINDATA_PROPERTY_TYPES.parentKey, item?.key]);
      if (!_.isEmpty(childRows)) {
        additionalData = _.concat(additionalData, childRows);
      }
    });
    if (!_.isEmpty(additionalData)) {
      result = _.concat(
        result,
        _.map(additionalData, (item) => ({
          ...item,
          key: `${item?.key}${pasteRowsCnt}`,
          parentKey: `${item?.parentKey}${pasteRowsCnt}`,
        })),
      );
    }
  } while (!_.isEmpty(additionalData));
  return result;
};
