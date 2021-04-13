import { TPDopeSheet, IsIncludedChange } from 'types/TP';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';
import { TP_TRACK_INDEX } from 'utils/const';

interface FnRenderTransformTrack {
  dopeSheetList: TPDopeSheet[];
  trackIndex: number;
}

type RenderTransformTrack = [Partial<TPDopeSheet>[], IsIncludedChange[]];

const fnRenderTransformTrack = ({
  dopeSheetList,
  trackIndex,
}: FnRenderTransformTrack): RenderTransformTrack => {
  const remainder = trackIndex % 10;
  const updatedDopeSheetList: Partial<TPDopeSheet>[] = [];
  const updatedCurrentVisualizedList: IsIncludedChange[] = [];

  const targetIndex = fnGetBinarySearch({
    collection: dopeSheetList,
    index: trackIndex,
    key: 'trackIndex',
  });
  const targetTrack = dopeSheetList[targetIndex];

  if (!targetTrack.isExcludedRendering) {
    updatedDopeSheetList.push({
      trackIndex,
      isExcludedRendering: true,
    });
    updatedCurrentVisualizedList.push({
      name: targetTrack.trackName,
      isIncluded: true,
    });
  } else {
    const layerIndex = Math.floor(trackIndex / 10000) * 10000 + 2;
    let boneIndex = 0;
    switch (remainder) {
      case TP_TRACK_INDEX.POSITION_A:
      case TP_TRACK_INDEX.POSITION_B: {
        boneIndex = trackIndex - 1;
        break;
      }
      case TP_TRACK_INDEX.ROTATION_A:
      case TP_TRACK_INDEX.ROTATION_B: {
        boneIndex = trackIndex - 2;
        break;
      }
      case TP_TRACK_INDEX.SCALE_A:
      case TP_TRACK_INDEX.SCALE_B: {
        boneIndex = trackIndex - 3;
        break;
      }
    }
    updatedDopeSheetList.push({
      trackIndex: layerIndex,
      isExcludedRendering: false,
    });
    updatedDopeSheetList.push({
      trackIndex: boneIndex,
      isExcludedRendering: false,
    });
    updatedDopeSheetList.push({
      trackIndex,
      isExcludedRendering: false,
    });
    updatedCurrentVisualizedList.push({
      name: targetTrack.trackName,
      isIncluded: false,
    });
  }

  return [updatedDopeSheetList, updatedCurrentVisualizedList];
};

export default fnRenderTransformTrack;
