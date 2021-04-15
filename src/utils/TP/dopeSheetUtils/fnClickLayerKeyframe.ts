import { TPDopeSheet, TPLastBone, KeyframeData } from 'types/TP';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';

interface FnClickLayerKeyframe {
  dopeSheetList: TPDopeSheet[];
  lastBoneList: TPLastBone[];
  layerKey: string;
  time: number;
  trackName: string;
  trackIndex: number;
}

const fnClickLayerKeyframe = ({
  dopeSheetList,
  lastBoneList,
  layerKey,
  time,
  trackIndex,
  trackName,
}: FnClickLayerKeyframe) => {
  const keyframeList: KeyframeData[] = [];
  const checkTransformTrack = (index: number) => {
    if (index % 10 === 3 || index % 10 === 7) return false;
    return true;
  };

  const targetIndex = fnGetBinarySearch({
    collection: lastBoneList,
    index: trackIndex,
    key: 'layerIndex',
  });
  const lastBone = lastBoneList[targetIndex];

  let curTrackIndex = lastBone.layerIndex + 1;
  let curDopeSheetIndex = fnGetBinarySearch({
    collection: dopeSheetList,
    index: lastBone.layerIndex + 1,
    key: 'trackIndex',
  });

  // layer 키프레임 클릭
  keyframeList.push({
    isTransformTrack: false,
    key: `${layerKey}&&${trackName}&&${time}`,
    trackIndex,
    trackName,
    layerKey,
    time,
  });

  // 하위 Bone, Transform 키프레임 클릭
  while (curTrackIndex <= lastBone.lastBoneIndex + 3) {
    const track = dopeSheetList[curDopeSheetIndex];
    keyframeList.push({
      isTransformTrack: checkTransformTrack(track.trackIndex),
      key: `${layerKey}&&${track.trackName}&&${time}`,
      trackIndex: track.trackIndex,
      trackName: track.trackName,
      layerKey,
      time,
    });
    curTrackIndex += 1;
    curDopeSheetIndex += 1;
    if ((curTrackIndex - 1) % 10 === 0) curTrackIndex += 2;
  }

  return keyframeList;
};

export default fnClickLayerKeyframe;
