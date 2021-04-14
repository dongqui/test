import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { ROOT_FOLDER_NAME } from 'types/LP';
import fnGetFileName from './fnGetFileName';

interface FnDeleteFileProps {
  lpData: LPDataType[];
}
/**
 * 선택영역 표시를 도와주는 함수
 *
 * @param data - lpData
 * @param originalData - 가공전의 lpData
 *
 * @return 선택영역 표시를 위한 flag 값이 들어간 후의 lpData
 */
const fnPasteFile = ({ lpData }: FnDeleteFileProps) => {
  let result = _.clone(lpData);
  let additionalData: LPDataType[] = [];
  let key = '';
  if (!_.some(lpData, [LPDATA_PROPERTY_TYPES.isCopied, true])) {
    return result;
  }
  const copiedRow: LPDataType | undefined = _.find(lpData, [LPDATA_PROPERTY_TYPES.isCopied, true]);
  const pasteRowsCnt = _.size(_.filter(lpData, (item) => _.includes(item?.key, copiedRow?.key)));
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
          name: _.find(lpData, [LPDATA_PROPERTY_TYPES.isCopied, true])?.name ?? '',
          lpData: lpData,
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
export default fnPasteFile;
