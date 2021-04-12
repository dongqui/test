import { TPDopeSheet, TPLastBone, IsIncludedChange } from 'types/TP';
import { fnGetBinarySearch } from 'utils/TP/trackUtils';

interface FnRenderLayerTrack {
  dopeSheetList: TPDopeSheet[];
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

type RenderLayerTrack = [Partial<TPDopeSheet>[], IsIncludedChange[]];

const fnRenderLayerTrack = ({
  dopeSheetList,
  lastBoneList,
  trackIndex,
}: FnRenderLayerTrack): RenderLayerTrack => {
  const updatedDopeSheetList: Partial<TPDopeSheet>[] = [];
  const updatedCurrentVisualizedList: IsIncludedChange[] = [];

  const targetIndex = fnGetBinarySearch({
    collection: dopeSheetList,
    index: trackIndex,
    key: 'trackIndex',
  });
  const targetLastBoneIndex = fnGetBinarySearch({
    collection: lastBoneList,
    index: trackIndex,
    key: 'layerIndex',
  });

  const targetTrack = dopeSheetList[targetIndex];
  const { layerIndex, lastBoneIndex } = lastBoneList[targetLastBoneIndex];
  let curBoneIndex = layerIndex + 1;
  let dopeSheetIndex = targetIndex + 1;

  if (!targetTrack.isExcludedRendering) {
    updatedDopeSheetList.push({
      trackIndex,
      isExcludedRendering: true,
    });
    while (curBoneIndex <= lastBoneIndex + 3) {
      updatedDopeSheetList.push({
        trackIndex: curBoneIndex,
        isExcludedRendering: true,
      });
      if (curBoneIndex % 10 !== 3 && curBoneIndex % 10 !== 7) {
        updatedCurrentVisualizedList.push({
          name: dopeSheetList[dopeSheetIndex].trackName,
          isIncluded: true,
        });
      }
      curBoneIndex += 1;
      dopeSheetIndex += 1;
      if ((curBoneIndex - 1) % 10 === 0) curBoneIndex += 2;
    }
  } else {
    updatedDopeSheetList.push({
      trackIndex,
      isExcludedRendering: false,
    });
    while (curBoneIndex <= lastBoneIndex + 3) {
      updatedDopeSheetList.push({
        trackIndex: curBoneIndex,
        isExcludedRendering: false,
      });
      if (curBoneIndex % 10 !== 3 && curBoneIndex % 10 !== 7) {
        updatedCurrentVisualizedList.push({
          name: dopeSheetList[dopeSheetIndex].trackName,
          isIncluded: false,
        });
      }
      curBoneIndex += 1;
      dopeSheetIndex += 1;
      if ((curBoneIndex - 1) % 10 === 0) curBoneIndex += 2;
    }
  }

  return [updatedDopeSheetList, updatedCurrentVisualizedList];
};

export default fnRenderLayerTrack;
