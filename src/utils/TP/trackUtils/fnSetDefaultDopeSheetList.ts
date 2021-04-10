import _ from 'lodash';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnGetSummaryTimes, fnGetLayerTimes, fnGetBoneTimes } from 'utils/TP/editingUtils';
import { ShootLayerType, ShootTrackType } from 'types';
import { TPDopeSheet } from 'types/TP';

interface FnSetDefaultDopeSheetList {
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
}

interface SetDopeSheetStatus {
  isClickedParentTrack: boolean;
  isTransformTrack: boolean;
  times: number[];
  trackIndex: number;
  trackName: string;
}

interface SetBoneTrackStatus {
  layer: ShootTrackType[];
}

const fnSetDefaultDopeSheetList = ({ baseLayer, layers }: FnSetDefaultDopeSheetList) => {
  const dopeSheetList: TPDopeSheet[] = [];
  const summaryTimes = fnGetSummaryTimes({ baseLayer, layers });
  const baseTimes = fnGetLayerTimes({ targetLayer: baseLayer });
  let dopeSheetIndex = TP_TRACK_INDEX.SUMMARY;

  // Summary, Base 트랙 status 추가
  for (let index = 0; index < 2; index += 1) {
    const dopeSheetStatus = setDopeSheetStatus({
      isClickedParentTrack: index === 0 ? true : false,
      isTransformTrack: false,
      times: index === 0 ? summaryTimes : baseTimes,
      trackIndex: dopeSheetIndex,
      trackName: index === 0 ? 'Summary' : 'Base',
    });
    dopeSheetList.push(dopeSheetStatus);
    dopeSheetIndex += 1;
  }

  // Base 하위 Bone, Transform 트랙 세팅
  const baseBoneTrackStatus = setBoneTrackStatus({ layer: baseLayer });
  dopeSheetList.push(...baseBoneTrackStatus);

  // layers 트랙
  _.forEach(layers, (layer) => {
    const layerBoneTrackStatus = setBoneTrackStatus({ layer: layer.tracks });
    dopeSheetList.push(...layerBoneTrackStatus);
  });

  return dopeSheetList;
};

const setDopeSheetStatus = ({
  isClickedParentTrack,
  isTransformTrack,
  times,
  trackIndex,
  trackName,
}: SetDopeSheetStatus) => ({
  isSelected: false,
  isLocked: false,
  isExcludedRendering: false,
  isFiltered: true,
  isClickedParentTrack,
  isKeyframeSelected: false,
  isTransformTrack,
  layerKey: 'baseLayer',
  trackIndex,
  trackName,
  times,
});

const setBoneTrackStatus = ({ layer }: SetBoneTrackStatus) => {
  const dopeSheetList: TPDopeSheet[] = [];
  const nextBoneIndex = TP_TRACK_INDEX.BONE_A; // 3
  let dopeSheetIndex = TP_TRACK_INDEX.SUMMARY;

  for (let boneIndex = 0; boneIndex < layer.length; boneIndex += nextBoneIndex) {
    const currnetBoneTrack = layer[boneIndex];
    const boneTimes = fnGetBoneTimes({
      positionTrack: layer[boneIndex],
      rotationTrack: layer[boneIndex + 1],
      scaleTrack: layer[boneIndex + 2],
    });

    // Bone track status 추가
    const dopeSheetStatus = setDopeSheetStatus({
      isClickedParentTrack: false,
      isTransformTrack: false,
      times: boneTimes,
      trackIndex: dopeSheetIndex,
      trackName: _.split(currnetBoneTrack.name, '.')[0],
    });
    dopeSheetList.push(dopeSheetStatus);
    dopeSheetIndex += 1;

    // Transform track status 추가
    for (
      let transformIndex = boneIndex;
      transformIndex < boneIndex + nextBoneIndex;
      transformIndex += 1
    ) {
      const x: number[] = [];
      const y: number[] = [];
      const z: number[] = [];

      _.forEach(layer[transformIndex].values, (transform, index) => {
        const remainder = index % nextBoneIndex;
        if (remainder === 0) x.push(transform);
        else if (remainder === 1) y.push(transform);
        else z.push(transform);
      });

      const dopeSheetStatus = setDopeSheetStatus({
        isClickedParentTrack: false,
        isTransformTrack: true,
        times: currnetBoneTrack.times,
        trackIndex: dopeSheetIndex,
        trackName: layer[transformIndex].name,
      });
      dopeSheetList.push(dopeSheetStatus);
      dopeSheetIndex += 1;
    }
    if ((dopeSheetIndex - 1) % 10 === 0) dopeSheetIndex += 2; // 11 -> 13, 21 -> 23
  }

  return dopeSheetList;
};

export default fnSetDefaultDopeSheetList;
