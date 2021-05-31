import { TPTrackList } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';

interface SetDopeSheetStatus {
  isShowed: boolean;
  isTransformTrack: boolean;
  isIncluded: boolean;
  layerKey?: string;
  times: number[];
  trackIndex: number;
  trackName: string;
  visualizedDataKey: string;
}

/**
 * dope shee의 status를 생성하는 함수입니다.
 * layerKey의 값을 주지 않을 경우, 기본적으로 baseLayer으로 값을 내려줍니다.
 *
 * @param isShowed -
 * @param isIncluded -
 * @param isTransformTrack -
 * @param layerKey -
 * @param times -
 * @param trackIndex -
 * @param trackName -
 * @param visualizedDataKey -
 * @return dopeSheetStatus
 */
const setDopeSheetStatus = ({
  isShowed,
  isIncluded,
  isTransformTrack,
  layerKey = 'baseLayer',
  times,
  trackIndex,
  trackName,
  visualizedDataKey,
}: SetDopeSheetStatus): TPTrackList => ({
  isSelected: false,
  isLocked: false,
  isIncluded,
  isFiltered: true,
  isShowed,
  isTransformTrack,
  isPointedDownArrow: trackIndex === TP_TRACK_INDEX.SUMMARY ? true : false,
  renderedTrackName: '',
  layerKey,
  trackIndex,
  trackName,
  times,
  visualizedDataKey,
});

export default setDopeSheetStatus;
