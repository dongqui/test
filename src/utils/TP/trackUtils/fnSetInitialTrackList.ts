import _ from 'lodash';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetSummaryTimes } from 'utils/TP/editingUtils';
import { fnSetTrackDataField, fnSetNewLayerTrack } from 'utils/TP/trackUtils';
import { ShootLayerType, ShootTrackType } from 'types';
import { TPTrackList, TPLastBone } from 'types/TP';

interface FnSetInitialTrackList {
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  visualizedDataKey: string;
}

type Return = [TPTrackList[], TPLastBone[]];

/**
 * 현재 visualized 된 모델을 기준으로 track list 데이터를 가공하는 함수입니다.
 * 최초 visualize, 모델 변경 시에서 사용 됩니다.
 *
 * @param baseLayer
 * @param layers
 * @param visualizedDataKey
 * @returns TPTrackList[] - baseLayer, layers 기준으로 가공 된 track list
 * @returns TPLastBone[] - 각 layer의 마지막 bone status
 */

const fnSetInitialTrackList = (params: FnSetInitialTrackList): Return => {
  const { baseLayer, layers, visualizedDataKey } = params;
  const dopeSheetList: TPTrackList[] = [];
  const lastBoneList: TPLastBone[] = [];

  // Summary 트랙 세팅
  const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });
  const summaryTrackStatus = fnSetTrackDataField({
    isIncluded: true,
    layerKey: 'baseLayer',
    times: summaryTimes,
    trackIndex: TP_TRACK_INDEX.SUMMARY,
    trackName: 'Summary',
    visualizedDataKey,
  });
  dopeSheetList.push(summaryTrackStatus);

  // base layer 트랙 세팅
  const [baseLayerTrack, lastBone] = fnSetNewLayerTrack({
    layer: baseLayer,
    layerIndex: TP_TRACK_INDEX.LAYER,
    layerName: 'Base',
    layerKey: 'baseLayer',
    visualizedDataKey,
  });
  dopeSheetList.push(...baseLayerTrack);
  lastBoneList.push(lastBone);

  // layers 트랙 세팅
  _.forEach(layers, (layer, index) => {
    const layerIndex = (index + 1) * 10000 + TP_TRACK_INDEX.LAYER;
    const [layerTrack, lastBone] = fnSetNewLayerTrack({
      layer: layer.tracks,
      layerIndex,
      layerName: layer.name,
      layerKey: layer.key,
      visualizedDataKey,
    });
    dopeSheetList.push(...layerTrack);
    lastBoneList.push(lastBone);
  });

  return [dopeSheetList, lastBoneList];
};

export default fnSetInitialTrackList;
