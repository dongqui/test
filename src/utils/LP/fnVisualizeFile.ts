import { FILE_TYPES, LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { storeLpData } from 'lib/store';
import _ from 'lodash';
import { Dispatch } from 'react';
import {
  resetCurrentVisualizedData,
  setCurrentVisualizedData,
} from 'actions/currentVisualizedData';

interface FnVisualizeFileProps {
  key: string;
  lpData: LPDataType[];
  dispatch: Dispatch<any>; // 설계상 로직이 포함되도록 되어 있어 유지한채 사용
}
/**
 * 파일을 visualize 해준다
 *
 * @param key - key값
 * @param lpData - lpData
 * @param dispatch - redux dispatch 함수
 *
 */
const fnVisualizeFile = ({ key, lpData, dispatch }: FnVisualizeFileProps) => {
  const targetRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.key, key]);
  let visualizedKey = targetRow?.key;
  if (_.isEqual(targetRow?.type, FILE_TYPES.folder)) {
    return;
  }
  if (_.isEqual(targetRow?.type, FILE_TYPES.file)) {
    const defaultVisulizedMotionRow = _.find(lpData, [
      LPDATA_PROPERTY_TYPES.parentKey,
      targetRow?.key,
    ]);
    if (defaultVisulizedMotionRow) {
      visualizedKey = defaultVisulizedMotionRow?.key;
    }
  }
  if (targetRow?.isExportedMotion) {
    return;
  }
  const visualizedRow = _.find(lpData, [LPDATA_PROPERTY_TYPES.key, visualizedKey]);
  if (visualizedRow) {
    storeLpData(
      _.map(lpData, (item) => ({
        ...item,
        isVisualized: _.isEqual(visualizedRow?.key, item.key),
        isDragging: false,
      })),
    );
    if (_.isEqual(visualizedRow?.type, FILE_TYPES.motion)) {
      dispatch(
        setCurrentVisualizedData({
          data: {
            key: visualizedRow.key ?? '',
            name: visualizedRow.name ?? '',
            type: visualizedRow.type ?? FILE_TYPES.file,
            boneNames: visualizedRow.boneNames ?? [],
            baseLayer: visualizedRow.baseLayer ?? [],
            layers: visualizedRow.layers ?? [],
          },
        }),
      );
    } else {
      dispatch(resetCurrentVisualizedData());
    }
  }
};
export default fnVisualizeFile;
