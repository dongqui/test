import { LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import _ from 'lodash';

interface FnMakeSelectionProps {
  data: LPDataType[];
  originalData: LPDataType[];
}
/**
 * 선택영역 표시를 도와주는 함수
 *
 * @param data - lpData
 * @param originalData - 가공전의 lpData
 *
 * @return 선택영역 표시를 위한 flag 값이 들어간 후의 lpData
 */
const fnMakeSelection = ({ data, originalData }: FnMakeSelectionProps) => {
  const result: LPDataType[] = [];
  let isFirst = false;
  let isLast = false;
  let isSelected = false;
  let isVisualizeSelected = false;
  let depth = 0;
  let clickedRow = _.find(data, [LPDATA_PROPERTY_TYPES.isClicked, true]);
  let visualizedRow = _.find(originalData, [LPDATA_PROPERTY_TYPES.isVisualized, true]);
  do {
    if (_.some(data, [LPDATA_PROPERTY_TYPES.key, clickedRow?.parentKey])) {
      clickedRow = _.find(data, [LPDATA_PROPERTY_TYPES.key, clickedRow?.parentKey]);
    }
  } while (_.some(data, [LPDATA_PROPERTY_TYPES.key, clickedRow?.parentKey]));
  do {
    if (_.some(originalData, [LPDATA_PROPERTY_TYPES.key, visualizedRow?.parentKey])) {
      visualizedRow = _.find(originalData, [LPDATA_PROPERTY_TYPES.key, visualizedRow?.parentKey]);
    }
  } while (_.some(originalData, [LPDATA_PROPERTY_TYPES.key, visualizedRow?.parentKey]));
  _.forEach(data, (item, index) => {
    isFirst = false;
    isLast = false;
    if (!_.some(data, [LPDATA_PROPERTY_TYPES.key, item?.parentKey])) {
      isFirst = true;
      isLast = false;
      if (_.isEqual(clickedRow?.key, item?.key)) {
        isSelected = true;
      }
      if (_.isEqual(visualizedRow?.key, item?.key)) {
        isVisualizeSelected = true;
      }
    }
    if (!_.some(data, [LPDATA_PROPERTY_TYPES.key, data?.[index + 1]?.parentKey])) {
      isLast = true;
    }
    depth = (_.find(result, [LPDATA_PROPERTY_TYPES.key, item?.parentKey])?.depth ?? 0) + 1;
    result.push({ ...item, isFirst, isLast, depth, isSelected, isVisualizeSelected });
    if (isLast) {
      isSelected = false;
      isVisualizeSelected = false;
    }
  });
  return result;
};
export default fnMakeSelection;
