import { TPDopeSheet, TPLastBone, IsIncludedChange } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import {
  fnRenderBoneTrack,
  fnRenderLayerTrack,
  fnRenderTransformTrack,
} from 'utils/TP/dopeSheetUtils';

interface FnClickRenderingButton {
  dopeSheetList: TPDopeSheet[];
  lastBoneList: TPLastBone[];
  trackIndex: number;
}

type RenderingButton = [Partial<TPDopeSheet>[], IsIncludedChange[]];

const fnClickRenderingButton = ({
  dopeSheetList,
  lastBoneList,
  trackIndex,
}: FnClickRenderingButton): RenderingButton => {
  const remainder = trackIndex % 10;
  const updatedDopeSheetList: Partial<TPDopeSheet>[] = [];
  const updatedCurrentVisualizedList: IsIncludedChange[] = [];

  switch (remainder) {
    // 레이어 트랙
    case TP_TRACK_INDEX.LAYER: {
      const [updatedDopeSheet, updatedCurrentVisualized] = fnRenderLayerTrack({
        dopeSheetList,
        lastBoneList,
        trackIndex,
      });
      updatedDopeSheetList.push(...updatedDopeSheet);
      updatedCurrentVisualizedList.push(...updatedCurrentVisualized);
      break;
    }
    // bone 트랙
    case TP_TRACK_INDEX.BONE_A:
    case TP_TRACK_INDEX.BONE_B: {
      const [updatedDopeSheet, updatedCurrentVisualized] = fnRenderBoneTrack({
        dopeSheetList,
        trackIndex,
      });
      updatedDopeSheetList.push(...updatedDopeSheet);
      updatedCurrentVisualizedList.push(...updatedCurrentVisualized);
      break;
    }
    // transform 트랙
    default: {
      const [updatedDopeSheet, updatedCurrentVisualized] = fnRenderTransformTrack({
        dopeSheetList,
        trackIndex,
      });
      updatedDopeSheetList.push(...updatedDopeSheet);
      updatedCurrentVisualizedList.push(...updatedCurrentVisualized);
      break;
    }
  }

  return [updatedDopeSheetList, updatedCurrentVisualizedList];
};

export default fnClickRenderingButton;
