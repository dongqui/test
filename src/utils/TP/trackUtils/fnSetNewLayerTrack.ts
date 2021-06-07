import _ from 'lodash';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetLayerTimes, fnGetBoneTimes } from 'utils/TP/editingUtils';
import { fnSetTrackDataField } from 'utils/TP/trackUtils';
import { ShootTrackType } from 'types';
import { TPTrackList, TPLastBone } from 'types/TP';

interface FnSetNewLayerTrack {
  layer: ShootTrackType[];
  layerIndex: number;
  layerName: string;
  layerKey: string;
  visualizedDataKey: string;
}

type Return = [TPTrackList[], TPLastBone];

/**
 * base layer, layers를 기준으로 track list를 가공하는 함수입니다.
 * fnSetInitialTrackList에서 함수를 호출하고, 레이어를 추가 할 때도 사용됩니다.
 *
 * @param layer - base layer와 layers의 layer
 * @param layerIndex
 * @param layerName
 * @param layerKey - base layer의 key는 "baseLayer"
 * @param visualizedDataKey
 * @returns TPTrackList[] - baseLayer, layers 기준으로 가공 된 track list
 * @returns TPLastBone - 각 layer의 마지막 bone status
 */

const getIsIncluded = (trackList: ShootTrackType[]) => {
  return trackList.every((track) => track.isIncluded === true);
};

const fnSetNewLayerTrack = (params: FnSetNewLayerTrack): Return => {
  const { layer, layerIndex, layerName, layerKey, visualizedDataKey } = params;
  const dopeSheetList: TPTrackList[] = [];
  let trackIndex = layerIndex;

  // Layer 트랙 세팅
  const layerTimes = fnGetLayerTimes({ targetLayer: layer });
  const layerTrackStatus = fnSetTrackDataField({
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
    const boneTrackStatus = fnSetTrackDataField({
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
      const transformTrackStatus = fnSetTrackDataField({
        isIncluded: getIsIncluded([transformTrack]),
        layerKey,
        times: _.map(transformTrack.times, (time) => _.round(time, 4)),
        trackIndex: trackIndex,
        trackName: transformTrack.name,
        visualizedDataKey,
      });
      const nextTrackIndex = trackIndex % 10 === TP_TRACK_INDEX.SCALE ? 7 : 1; // 6 -> 13, 16 -> 23
      trackIndex += nextTrackIndex;
      dopeSheetList.push(transformTrackStatus);
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
