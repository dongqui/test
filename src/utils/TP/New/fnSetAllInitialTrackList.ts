import _ from 'lodash';
import { fnGetSummaryTimes } from 'utils/TP/editingUtils';
import { fnSetTrackStatus, fnSetInitialLayerTrack } from 'utils/TP/New';
import { TP_TRACK_INDEX } from 'utils/const';
import { ShootLayerType, ShootTrackType } from 'types';
import { TPTrackList, TPLastBone } from 'types/TP';

interface FnSetAllInitialTrackList {
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  visualizedDataKey: string;
}

type Return = [TPTrackList[], TPLastBone[]];

const fnSetAllInitialTrackList = (params: FnSetAllInitialTrackList): Return => {
  const { baseLayer, layers, visualizedDataKey } = params;
  const dopeSheetList: TPTrackList[] = [];
  const lastBoneList: TPLastBone[] = [];

  // Summary 트랙 세팅
  const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });
  const summaryTrackStatus = fnSetTrackStatus({
    isIncluded: true,
    times: summaryTimes,
    trackIndex: TP_TRACK_INDEX.SUMMARY,
    trackName: 'Summary',
    visualizedDataKey,
  });
  dopeSheetList.push(summaryTrackStatus);

  // base layer 트랙 세팅
  const [baseLayerTrack, lastBone] = fnSetInitialLayerTrack({
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
    const [layerTrack, lastBone] = fnSetInitialLayerTrack({
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

export default fnSetAllInitialTrackList;
