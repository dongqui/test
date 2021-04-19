import _ from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types';
import { TPTrackName, TPLastBone } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnSetLayerTrack } from './index';

interface FnSetDefaultTrackNameList {
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
}

type DefaultTrackNameList = [TPTrackName[], TPLastBone[]];

/**
 * 최초에 visualized 되거나 모델이 변경 되었을 때, 계층 구조 형식으로 트랙들을 생성하는 함수입니다.
 *
 * @param baseLayer
 * @param layers
 * @return defaultTrackNameList
 */
const fnSetDefaultTrackNameList = ({
  baseLayer,
  layers,
}: FnSetDefaultTrackNameList): DefaultTrackNameList => {
  const trackNameList: TPTrackName[] = [];
  const lastBoneList: TPLastBone[] = [];

  // Summary 트랙 추가
  trackNameList.push({
    name: 'Summary',
    trackIndex: TP_TRACK_INDEX.SUMMARY, // 1
    isOpenedChildrenTrack: false,
    childrenTrackList: [],
  });

  // Base 트랙 추가
  const [base, baseLastBone] = fnSetLayerTrack({
    layerIndex: TP_TRACK_INDEX.LAYER,
    layerKey: 'baseLayer',
    tracks: baseLayer,
    trackName: 'Base',
  });
  lastBoneList.push(baseLastBone);
  trackNameList[0].childrenTrackList.push(...base);

  // Layers 트랙 추가
  _.forEach(layers, (layer, index) => {
    const [childrenTrack, layerLastBone] = fnSetLayerTrack({
      layerIndex: TP_TRACK_INDEX.LAYER + (index + 1) * 10000,
      layerKey: layer.key,
      tracks: layer.tracks,
      trackName: layer.name,
    });
    lastBoneList.push(layerLastBone);
    trackNameList[0].childrenTrackList.push(...childrenTrack);
  });

  return [trackNameList, lastBoneList];
};

export default fnSetDefaultTrackNameList;
