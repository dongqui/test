import _ from 'lodash';
import { fnGetLayerTimes, fnGetBoneTimes } from 'utils/TP/editingUtils';
import { ShootTrackType } from 'types';
import { TPDopeSheet } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnSetDopeSheetStatus } from './index';

interface SetyLayerDopeSheet {
  layer: ShootTrackType[];
  layerIndex: number;
  layerName: string;
  layerKey?: string;
}

/**
 * layer와 하위 트랙들의 status를 생성하는 함수입니다.
 *
 * @param layer - dope sheet status를 생성 할 layer
 * @param layerIndex - layer 트랙의 index
 * @param layerName - layer 트랙의 name
 * @param layerKey - 각 layer의 key(optional)
 * @return layerDopeSheet
 */
const fnSetyLayerDopeSheet = ({ layer, layerIndex, layerName, layerKey }: SetyLayerDopeSheet) => {
  const layerTimes = fnGetLayerTimes({ targetLayer: layer });
  const dopeSheetList: TPDopeSheet[] = [];
  const boneIncluded: boolean[] = [];
  const nextBoneIndex = TP_TRACK_INDEX.BONE_A; // 3
  let trackIndex = layerIndex;
  let count = 1;

  // Layer 트랙 status 추가
  const layerTrackStatus = fnSetDopeSheetStatus({
    isOpenedParentTrack: true,
    isTransformTrack: false,
    isIncluded: true,
    layerKey,
    times: _.map(layerTimes, (time) => ({ time, isClicked: false })),
    trackIndex: trackIndex,
    trackName: layerName,
  });
  dopeSheetList.push(layerTrackStatus);
  trackIndex += 1;

  // Bone, Transform 트랙 세팅
  for (let boneIndex = 0; boneIndex < layer.length; boneIndex += nextBoneIndex) {
    const transformIncluded: boolean[] = [];
    const currnetBoneTrack = layer[boneIndex];
    const boneTimes = fnGetBoneTimes({
      positionTrack: layer[boneIndex],
      rotationTrack: layer[boneIndex + 1],
      scaleTrack: layer[boneIndex + 2],
    });

    // Bone 트랙 status 추가
    const boneTrackStatus = fnSetDopeSheetStatus({
      isOpenedParentTrack: false,
      isTransformTrack: false,
      isIncluded: true,
      layerKey,
      times: _.map(boneTimes, (time) => ({ time, isClicked: false })),
      trackIndex: trackIndex,
      trackName: _.split(currnetBoneTrack.name, '.')[0],
    });
    dopeSheetList.push(boneTrackStatus);
    trackIndex += 1;

    // Transform 트랙 status 추가
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

      const transformTimes = layer[transformIndex].times;
      const transformTrackStatus = fnSetDopeSheetStatus({
        isOpenedParentTrack: false,
        isIncluded: layer[transformIndex].isIncluded,
        isTransformTrack: true,
        layerKey,
        times: _.map(transformTimes, (time) => ({
          time: _.round(time, 4),
          isClicked: false,
        })),
        trackIndex,
        trackName: layer[transformIndex].name,
      });
      transformIncluded.push(layer[transformIndex].isIncluded);
      dopeSheetList.push(transformTrackStatus);
      trackIndex += 1;
      if ((trackIndex - 1) % 10 === 0) trackIndex += 2; // ex) 11 -> 13, 21 -> 23
    }
    dopeSheetList[boneIndex + count].isIncluded = _.every(transformIncluded); // bone isIncluded 값 설정
    boneIncluded.push(dopeSheetList[boneIndex].isIncluded);
    count += 1;
  }
  dopeSheetList[0].isIncluded = _.every(boneIncluded); // layer isIncluded 값 설정

  return dopeSheetList;
};

export default fnSetyLayerDopeSheet;
