import { FILE_TYPES, MainDataType, MAINDATA_PROPERTY_TYPES } from 'types';
import _ from 'lodash';

interface fnMakeSelectionProps {
  data: MainDataType[];
}
export const fnMakeSelection = ({ data }: fnMakeSelectionProps) => {
  let result: MainDataType[] = [];
  let isFirst = false;
  let isLast = false;
  let depth = 0;
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
    depth = (_.find(result, [MAINDATA_PROPERTY_TYPES.key, item?.parentKey])?.depth ?? 0) + 1;
    result.push({ ...item, isFirst, isLast, depth });
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
