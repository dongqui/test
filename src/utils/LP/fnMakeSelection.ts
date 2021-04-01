import { FILE_TYPES, MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import _ from 'lodash';

interface fnMakeSelectionProps {
  data: MainDataType[];
}
// export const fnMakeSelectionOld = ({ data }: fnMakeSelectionProps) => {
//   let result = _.clone(data);
//   let selectedRowKeys: string[] = [];
//   let visualizedRowKeys: string[] = [];
//   const clickedRow = _.find(result, [MAINDATA_PROPERTY_TYPES.isClicked, true]);
//   let key = _.isEqual(clickedRow?.type, FILE_TYPES.file) ? clickedRow?.key : clickedRow?.parentKey;
//   selectedRowKeys = _.concat(selectedRowKeys, key ?? '');
//   selectedRowKeys = _.concat(
//     selectedRowKeys,
//     _.map(_.filter(result, [MAINDATA_PROPERTY_TYPES.parentKey, key]), (item) => item.key),
//   );
//   const visualizedRow = _.find(result, [MAINDATA_PROPERTY_TYPES.isVisualized, true]);
//   key = _.isEqual(visualizedRow?.type, FILE_TYPES.file)
//     ? visualizedRow?.key
//     : visualizedRow?.parentKey;
//   visualizedRowKeys = _.concat(visualizedRowKeys, key ?? '');
//   visualizedRowKeys = _.concat(
//     visualizedRowKeys,
//     _.map(_.filter(result, [MAINDATA_PROPERTY_TYPES.parentKey, key]), (item) => item.key),
//   );
//   result = _.map(result, (item) => ({
//     ...item,
//     isSelected: _.includes(selectedRowKeys, item.key),
//     isVisualizeSelected: _.includes(visualizedRowKeys, item.key),
//   }));
//   return result;
// };
export const fnMakeSelection = ({ data }: fnMakeSelectionProps) => {
  let result: MainDataType[] = [];
  let isFirst = false;
  let isLast = false;
  _.forEach(data, (item, index) => {
    if (_.isEqual(item.type, FILE_TYPES.file)) {
      isFirst = true;
      isLast = false;
    }
    if (_.isEqual(item.type, FILE_TYPES.motion)) {
      isFirst = false;
      isLast = false;
    }
    if (
      _.isEqual(data?.[index + 1]?.type, FILE_TYPES.folder) ||
      _.isEqual(data?.[index + 1]?.type, FILE_TYPES.file) ||
      _.isEqual(index, _.size(data) - 1)
    ) {
      isLast = true;
    }
    result.push({ ...item, isFirst, isLast });
  });
  let clickedRow = _.find(result, [MAINDATA_PROPERTY_TYPES.isClicked, true]);
  let visualizedRow = _.find(result, [MAINDATA_PROPERTY_TYPES.isVisualized, true]);
  if (_.isEqual(clickedRow?.type, FILE_TYPES.motion)) {
    clickedRow = _.find(result, [MAINDATA_PROPERTY_TYPES.key, clickedRow?.parentKey]);
  }
  if (_.isEqual(visualizedRow?.type, FILE_TYPES.motion)) {
    visualizedRow = _.find(result, [MAINDATA_PROPERTY_TYPES.key, visualizedRow?.parentKey]);
  }
  result = _.map(result, (item) => ({
    ...item,
    isSelected: _.isEqual(item.key, clickedRow?.key) || _.isEqual(item.parentKey, clickedRow?.key),
    isVisualizeSelected:
      _.isEqual(item.key, visualizedRow?.key) || _.isEqual(item.parentKey, visualizedRow?.key),
  }));
  return result;
};
