import _ from 'lodash';
import { TPTrackList } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';

interface SetDopeSheetStatus {
  isIncluded: boolean;
  layerKey?: string;
  times: number[];
  trackIndex: number;
  trackName: string;
  visualizedDataKey: string;
}

/**
 * currentVisualizedData 기준으로 TP에서 사용 할 수 있도록 데이터를 가공합니다.
 *
 * @param isIncluded - 애니메이션 랜더링 포함시킬지 체크
 * @param layerKey - 각 layer의 key값
 * @param times - 각 track의 times
 * @param trackIndex - 트렉 별 index
 * @param trackName - 트랙 name
 * @param visualizedDataKey - 현재 visualize 된 model의 key
 * @return dopeSheetStatus
 */
const setDopeSheetStatus = ({
  isIncluded,
  layerKey = 'baseLayer',
  times,
  trackIndex,
  trackName,
  visualizedDataKey,
}: SetDopeSheetStatus): TPTrackList => {
  const { SUMMARY, LAYER, BONE_A, BONE_B } = TP_TRACK_INDEX;
  const remainder = trackIndex % 10;
  const isPointedDownArrow = trackIndex === SUMMARY ? true : false;
  const isShowed = _.some([SUMMARY, LAYER], (index) => index === remainder);
  const isTransformTrack = _.every([SUMMARY, LAYER, BONE_A, BONE_B], (idx) => idx !== remainder);
  const renderedTrackName = isTransformTrack ? _.split(trackName, '.')[1] : trackName;

  return {
    isFiltered: true,
    isIncluded,
    isLocked: false,
    isPointedDownArrow,
    isSelected: false,
    isShowed,
    isTransformTrack,
    layerKey,
    renderedTrackName,
    trackIndex,
    trackName,
    times,
    visualizedDataKey,
  };
};

export default setDopeSheetStatus;
