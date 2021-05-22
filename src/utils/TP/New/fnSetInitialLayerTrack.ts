import _ from 'lodash';
import { ShootTrackType } from 'types';
import { TPDopeSheet, TPLastBone } from 'types/TP';
import { fnSetTrackStatus } from 'utils/TP/New';
import { fnGetLayerTimes, fnGetBoneTimes } from 'utils/TP/editingUtils';

interface FnSetLayerChildrenTracks {
  layer: ShootTrackType[];
  layerIndex: number;
  layerName: string;
  layerKey: string;
  visualizedDataKey: string;
}

type Return = [TPDopeSheet[], TPLastBone];

const setIncluded = (trackList: ShootTrackType[]) => {
  return trackList.every((track) => track.isIncluded === true);
};

const fnSetLayerChildrenTracks = (params: FnSetLayerChildrenTracks): Return => {
  const { layer, layerIndex, layerName, layerKey, visualizedDataKey } = params;
  const dopeSheetList: TPDopeSheet[] = [];
  let trackIndex = layerIndex;

  // Layer 트랙 세팅
  const layerTimes = fnGetLayerTimes({ targetLayer: layer });
  const layerTrackStatus = fnSetTrackStatus({
    isIncluded: setIncluded(layer),
    layerKey,
    times: layerTimes,
    trackIndex: layerIndex,
    trackName: layerName,
    visualizedDataKey,
  });
  dopeSheetList.push(layerTrackStatus);
  trackIndex += 1;

  for (let positionTrackIndex = 0; positionTrackIndex < layer.length; positionTrackIndex += 3) {
    const transformTrackList = [
      layer[positionTrackIndex],
      layer[positionTrackIndex + 1],
      layer[positionTrackIndex + 2],
    ];
    // Bone 트랙 세팅
    const boneTimes = fnGetBoneTimes({
      positionTrack: layer[positionTrackIndex],
      rotationTrack: layer[positionTrackIndex + 1],
      scaleTrack: layer[positionTrackIndex + 2],
    });
    const boneTrackStatus = fnSetTrackStatus({
      isIncluded: setIncluded(transformTrackList),
      layerKey,
      times: boneTimes,
      trackIndex: trackIndex,
      trackName: _.split(layer[positionTrackIndex].name, '.')[0],
      visualizedDataKey,
    });
    dopeSheetList.push(boneTrackStatus);
    trackIndex += 1;

    // Transform 트랙 세팅
    for (const transformTrack of transformTrackList) {
      const transformTrackStatus = fnSetTrackStatus({
        isIncluded: setIncluded([transformTrack]),
        layerKey,
        times: _.map(transformTrack.times, (time) => _.round(time, 4)),
        trackIndex: trackIndex,
        trackName: transformTrack.name,
        visualizedDataKey,
      });
      dopeSheetList.push(transformTrackStatus);
      trackIndex += 1;
      if ((trackIndex - 1) % 10 === 0) trackIndex += 2;
    }
  }

  const lastBone = dopeSheetList[dopeSheetList.length - 4];
  const lastBoneValue: TPLastBone = {
    layerIndex,
    layerKey,
    trackName: lastBone.trackName,
    lastBoneIndex: lastBone.trackIndex,
  };
  return [dopeSheetList, lastBoneValue];
};

export default fnSetLayerChildrenTracks;
