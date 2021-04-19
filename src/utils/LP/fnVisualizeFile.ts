import { FILE_TYPES, LPDataType, LPDATA_PROPERTY_TYPES } from 'types';
import { storeCurrentVisualizedData, storeLpData } from 'lib/store';
import _ from 'lodash';

interface FnVisualizeFileProps {
  key: string;
  lpData: LPDataType[];
}
/**
 * 파일을 visualize 해준다
 *
 * @param key - key값
 * @param lpData - lpData
 *
 */
const fnVisualizeFile = ({ key, lpData }: FnVisualizeFileProps) => {
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
      storeCurrentVisualizedData({
        key: visualizedRow.key ?? '',
        name: visualizedRow.name ?? '',
        type: visualizedRow.type ?? FILE_TYPES.file,
        boneNames: visualizedRow.boneNames ?? [],
        baseLayer: visualizedRow.baseLayer ?? [],
        layers: visualizedRow.layers ?? [],
      });
    } else {
      storeCurrentVisualizedData(undefined);
    }
  }
};
export default fnVisualizeFile;
