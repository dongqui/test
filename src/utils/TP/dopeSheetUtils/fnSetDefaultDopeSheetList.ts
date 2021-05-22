import _ from 'lodash';
import { fnGetSummaryTimes } from 'utils/TP/editingUtils';
import { ShootLayerType, ShootTrackType } from 'types';
import { TPDopeSheet } from 'types/TP';
import { fnSetDopeSheetStatus, fnSetLayerDopeSheet } from './index';

interface FnSetDefaultDopeSheetList {
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  visualizedDataKey: string;
}
/**
 * 최초에 visualized 되거나 모델이 변경 되었을 때, dope sheet의 status를 생성하는 함수입니다.
 *
 * @param baseLayer
 * @param layers
 * @param visualizedDataKey
 * @return dopeSheetList - dope sheet status를 저장하고 있는 1차원 배열
 */
const fnSetDefaultDopeSheetList = ({
  baseLayer,
  layers,
  visualizedDataKey,
}: FnSetDefaultDopeSheetList) => {
  const dopeSheetList: TPDopeSheet[] = [];
  const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });

  // Summary 트랙 status 추가
  const summaryTrack = fnSetDopeSheetStatus({
    isShowed: true,
    isTransformTrack: false,
    isIncluded: true,
    times: summaryTimes,
    trackIndex: 1,
    trackName: 'Summary',
    visualizedDataKey,
  });
  dopeSheetList.push(summaryTrack);

  // Base, Bone, Transform 트랙 세팅
  const baseBoneTrackStatus = fnSetLayerDopeSheet({
    layer: baseLayer,
    layerIndex: 2,
    layerName: 'Base',
    visualizedDataKey,
  });
  dopeSheetList.push(...baseBoneTrackStatus);

  // layers 트랙
  _.forEach(layers, (layer, index) => {
    const layerBoneTrackStatus = fnSetLayerDopeSheet({
      layer: layer.tracks,
      layerIndex: (index + 1) * 10000 + 2,
      layerName: layer.name,
      layerKey: layer.key,
      visualizedDataKey,
    });
    dopeSheetList.push(...layerBoneTrackStatus);
  });

  return dopeSheetList;
};

export default fnSetDefaultDopeSheetList;
