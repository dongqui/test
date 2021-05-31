import { TPTrackList, KeyframeData } from 'types/TP';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';

interface FnClickBoneKeyframe {
  dopeSheetList: TPTrackList[];
  layerKey: string;
  time: number;
  trackIndex: number;
}

const fnClickBoneKeyframe = ({
  dopeSheetList,
  layerKey,
  time,
  trackIndex,
}: FnClickBoneKeyframe) => {
  const clickedKeyframes: KeyframeData[] = [];
  const checkTransformTrack = (index: number) => {
    if (index % 10 === 3 || index % 10 === 7) return false;
    return true;
  };

  const targetIndex = fnGetBinarySearch({
    collection: dopeSheetList,
    index: trackIndex,
    key: 'trackIndex',
  });

  for (let curTrackIndex = targetIndex; curTrackIndex <= targetIndex + 3; curTrackIndex += 1) {
    const track = dopeSheetList[curTrackIndex];
    clickedKeyframes.push({
      isTransformTrack: checkTransformTrack(track.trackIndex),
      isLocked: track.isLocked,
      key: `${layerKey}&&${track.trackName}&&${time}`,
      trackIndex: track.trackIndex,
      trackName: track.trackName,
      layerKey,
      time,
    });
  }

  return clickedKeyframes;
};

export default fnClickBoneKeyframe;
