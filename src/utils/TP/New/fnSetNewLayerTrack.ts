import _ from 'lodash';
import { ShootTrackType } from 'types';
import { TPTrackList, TPLastBone } from 'types/TP';
import { fnSetTrackStatus } from 'utils/TP/New';
import { fnGetLayerTimes, fnGetBoneTimes } from 'utils/TP/editingUtils';

interface FnSetNewLayerTrack {
  layer: ShootTrackType[];
  layerIndex: number;
  layerName: string;
  layerKey: string;
  visualizedDataKey: string;
}

type Return = [TPTrackList[], TPLastBone];

const getIsIncluded = (trackList: ShootTrackType[]) => {
  return trackList.every((track) => track.isIncluded === true);
};

const fnSetNewLayerTrack = (params: FnSetNewLayerTrack): Return => {
  const { layer, layerIndex, layerName, layerKey, visualizedDataKey } = params;
  const dopeSheetList: TPTrackList[] = [];
  let trackIndex = layerIndex;

  // Layer 트랙 세팅
  const layerTimes = fnGetLayerTimes({ targetLayer: layer });
  const layerTrackStatus = fnSetTrackStatus({
    isIncluded: getIsIncluded(layer),
    layerKey,
    times: layerTimes,
    trackIndex: layerIndex,
    trackName: layerName,
    visualizedDataKey,
  });
  dopeSheetList.push(layerTrackStatus);
  trackIndex += 1;

  for (let currentTrackIndex = 0; currentTrackIndex < layer.length; currentTrackIndex += 3) {
    const transformTrackList = [
      layer[currentTrackIndex],
      layer[currentTrackIndex + 1],
      layer[currentTrackIndex + 2],
    ];
    // Bone 트랙 세팅
    const boneTimes = fnGetBoneTimes({
      positionTrack: layer[currentTrackIndex],
      rotationTrack: layer[currentTrackIndex + 1],
      scaleTrack: layer[currentTrackIndex + 2],
    });
    const boneTrackStatus = fnSetTrackStatus({
      isIncluded: getIsIncluded(transformTrackList),
      layerKey,
      times: boneTimes,
      trackIndex: trackIndex,
      trackName: _.split(layer[currentTrackIndex].name, '.')[0],
      visualizedDataKey,
    });
    dopeSheetList.push(boneTrackStatus);
    trackIndex += 1;

    // Transform 트랙 세팅
    for (const transformTrack of transformTrackList) {
      const transformTrackStatus = fnSetTrackStatus({
        isIncluded: getIsIncluded([transformTrack]),
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
  const lastBonesStatus: TPLastBone = {
    layerIndex,
    layerKey,
    trackName: lastBone.trackName,
    lastBoneIndex: lastBone.trackIndex,
  };
  return [dopeSheetList, lastBonesStatus];
};

export default fnSetNewLayerTrack;
