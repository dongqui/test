import { LPDATA_PROPERTY_TYPES } from 'types';
import _ from 'lodash';
import { Dispatch } from 'react';
import {
  resetCurrentVisualizedData,
  setCurrentVisualizedData,
} from 'actions/currentVisualizedData';
import { LPItemListOldType } from 'types/LP';
import * as lpDataActions from 'actions/lpData';

interface FnVisualizeFileProps {
  key: string;
  lpData: LPItemListOldType;
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
  if (_.isEqual(targetRow?.type, 'Folder')) {
    return;
  }
  if (_.isEqual(targetRow?.type, 'File')) {
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
    dispatch(
      lpDataActions.setItemListOld({
        itemList: _.map(lpData, (item) => ({
          ...item,
          isVisualized: _.isEqual(visualizedRow?.key, item.key),
          isDragging: false,
        })),
      }),
    );
    if (_.isEqual(visualizedRow?.type, 'Motion')) {
      dispatch(
        setCurrentVisualizedData({
          data: {
            key: visualizedRow.key,
            name: visualizedRow.name,
            type: visualizedRow.type,
            boneNames: visualizedRow.boneNames || [],
            baseLayer: visualizedRow.baseLayer,
            layers: visualizedRow.layers,
            url: visualizedRow.url || '',
          },
        }),
      );
    } else {
      dispatch(resetCurrentVisualizedData());
    }
  }
};
export default fnVisualizeFile;
