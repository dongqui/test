import { TPDopeSheet, IsIncludedChange } from 'types/TP';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';

interface FnRenderBoneTrack {
  dopeSheetList: TPDopeSheet[];
  trackIndex: number;
}

type RenderBoneTrack = [Partial<TPDopeSheet>[], IsIncludedChange[]];

const fnRenderBoneTrack = ({ dopeSheetList, trackIndex }: FnRenderBoneTrack): RenderBoneTrack => {
  const updatedDopeSheetList: Partial<TPDopeSheet>[] = [];
  const updatedCurrentVisualizedList: IsIncludedChange[] = [];

  const targetIndex = fnGetBinarySearch({
    collection: dopeSheetList,
    index: trackIndex,
    key: 'trackIndex',
  });
  const targetTrack = dopeSheetList[targetIndex];
  let dopeSheetIndex = targetIndex + 1;

  if (!targetTrack.isExcludedRendering) {
    updatedDopeSheetList.push({
      trackIndex,
      isExcludedRendering: true,
    });
    for (
      let transformIndex = trackIndex + 1;
      transformIndex < trackIndex + 4;
      transformIndex += 1
    ) {
      updatedDopeSheetList.push({
        trackIndex: transformIndex,
        isExcludedRendering: true,
      });
      updatedCurrentVisualizedList.push({
        name: dopeSheetList[dopeSheetIndex].trackName,
        isIncluded: true,
      });
      dopeSheetIndex += 1;
    }
  } else {
    const layerIndex = Math.floor(trackIndex / 10000) * 10000 + 2;
    updatedDopeSheetList.push({
      trackIndex: layerIndex,
      isExcludedRendering: false,
    });
    updatedDopeSheetList.push({
      trackIndex,
      isExcludedRendering: false,
    });
    for (
      let transformIndex = trackIndex + 1;
      transformIndex < trackIndex + 4;
      transformIndex += 1
    ) {
      updatedDopeSheetList.push({
        trackIndex: transformIndex,
        isExcludedRendering: false,
      });
      updatedCurrentVisualizedList.push({
        name: dopeSheetList[dopeSheetIndex].trackName,
        isIncluded: true,
      });
      dopeSheetIndex += 1;
    }
  }

  return [updatedDopeSheetList, updatedCurrentVisualizedList];
};

export default fnRenderBoneTrack;
