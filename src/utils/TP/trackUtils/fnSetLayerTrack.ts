import _ from 'lodash';
import { TPTrackName, TPLastBone } from 'types/TP';
import { ShootTrackType } from 'types';

interface FnSetLayerTrack {
  layerIndex: number;
  layerKey: string;
  tracks: ShootTrackType[];
  trackName: string;
}

type LayerTrack = [TPTrackName[], TPLastBone];

/**
 * layer와 하위 트랙들을 계층 구조 형식으로 생성하는 함수입니다.
 *
 * @param layerIndex - layer 트랙의 index
 * @param layerKey - layer 트랙의 key
 * @param tracks - layerTrack을 생성시킬 트랙 리스트
 * @param trackName - layer 트랙 name
 * @return layerTrack
 */
const fnSetLayerTrack = ({
  layerIndex,
  layerKey,
  tracks,
  trackName,
}: FnSetLayerTrack): LayerTrack => {
  const trackNameList: TPTrackName[] = [];
  const nextBoneIndex = 3;
  let currentTrackIndex = layerIndex + 1; // 현재 track Index

  // Layer 생성
  trackNameList.push({
    name: trackName,
    trackIndex: layerIndex,
    isOpenedChildrenTrack: false,
    childrenTrack: [],
  });

  // Layer 트랙의 마지막 Bone 트랙 리스트
  const lastBoneList: TPLastBone = {
    layerKey,
    layerIndex,
    trackName,
    lastBoneIndex: 0,
  };

  // Bone, Transform 트랙 세팅
  for (
    let boneIndex = 0; // 0, 3, 6, 9...
    boneIndex < tracks.length;
    boneIndex += nextBoneIndex // 3
  ) {
    const layerTrack = trackNameList[0].childrenTrack;
    const [boneName] = tracks[boneIndex].name.split('.');

    // 마지막 bone track index가 현재 track index보다 작은 경우 갱신
    if (lastBoneList.lastBoneIndex < currentTrackIndex) {
      lastBoneList.lastBoneIndex = currentTrackIndex;
    }

    // Bone 트랙 추가
    layerTrack.push({
      name: boneName,
      trackIndex: currentTrackIndex,
      isOpenedChildrenTrack: false,
      childrenTrack: [],
    });
    currentTrackIndex += 1;

    // Transform 트랙 추가
    const boneTrack = layerTrack[boneIndex / 3].childrenTrack;
    for (
      let transformIndex = boneIndex;
      transformIndex < boneIndex + nextBoneIndex;
      transformIndex += 1
    ) {
      const splitedTransformName = tracks[transformIndex].name.split('.');
      const transformName = _.upperFirst(splitedTransformName[1]); // Position, Rotation, Scale
      boneTrack.push({
        name: transformName,
        trackIndex: currentTrackIndex,
        isOpenedChildrenTrack: false,
        childrenTrack: [],
      });
      currentTrackIndex += 1;
      if ((currentTrackIndex - 1) % 10 === 0) currentTrackIndex += 2; // 11 -> 13, 21 -> 23
    }
  }

  return [trackNameList, lastBoneList];
};

export default fnSetLayerTrack;
