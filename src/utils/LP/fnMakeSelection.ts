import { FILE_TYPES, MainDataTypes, MAINDATA_PROPERTY_TYPES } from 'interfaces';
import _ from 'lodash';

interface fnMakeSelectionProps {
  data: MainDataTypes[];
}
export const fnMakeSelection = ({ data }: fnMakeSelectionProps) => {
  let result = _.clone(data);
  let selectedRowKeys: string[] = [];
  let visualizedRowKeys: string[] = [];
  const clickedRow = _.find(result, [MAINDATA_PROPERTY_TYPES.isClicked, true]);
  let key = _.isEqual(clickedRow?.type, FILE_TYPES.file) ? clickedRow?.key : clickedRow?.parentKey;
  selectedRowKeys = _.concat(selectedRowKeys, key ?? '');
  selectedRowKeys = _.concat(
    selectedRowKeys,
    _.map(_.filter(result, [MAINDATA_PROPERTY_TYPES.parentKey, key]), (item) => item.key),
  );
  const visualizedRow = _.find(result, [MAINDATA_PROPERTY_TYPES.isVisualized, true]);
  key = _.isEqual(visualizedRow?.type, FILE_TYPES.file)
    ? visualizedRow?.key
    : visualizedRow?.parentKey;
  visualizedRowKeys = _.concat(visualizedRowKeys, key ?? '');
  visualizedRowKeys = _.concat(
    visualizedRowKeys,
    _.map(_.filter(result, [MAINDATA_PROPERTY_TYPES.parentKey, key]), (item) => item.key),
  );
  result = _.map(result, (item) => ({
    ...item,
    isSelected: _.includes(selectedRowKeys, item.key),
    isVisualizeSelected: _.includes(visualizedRowKeys, item.key),
  }));
  return result;
};
