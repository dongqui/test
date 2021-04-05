import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import { fnGetFileName } from './fnGetFileName';

interface fnDeleteFileProps {
  mainData: LPDataType[];
}

export const fnPasteFile = ({ mainData }: fnDeleteFileProps) => {
  let result = _.clone(mainData);
  let additionalData: LPDataType[] = [];
  let key = '';
  if (!_.some(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])) {
    return result;
  }
  const copiedRow: LPDataType | undefined = _.find(mainData, [
    LPDATA_PROPERTY_TYPES.isCopied,
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
          name: _.find(mainData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.name ?? '',
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
      childRows = _.filter(result, [LPDATA_PROPERTY_TYPES.parentKey, item?.key]);
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
