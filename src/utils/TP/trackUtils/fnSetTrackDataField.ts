import _ from 'lodash';
import { TP_TRACK_INDEX } from 'utils/const';
import { TPTrackList } from 'types/TP';

interface FnSetTrackDataField {
  isIncluded: boolean;
  layerKey: string;
  times: number[];
  trackIndex: number;
  trackName: string;
  visualizedDataKey: string;
}

/**
 * 트랙 데이터를 생성하는 함수입니다.
 *
 * @param isIncluded
 * @param layerKey
 * @param times
 * @param trackIndex
 * @param trackName
 * @param visualizedDataKey
 * @return track status
 */
const fnSetTrackDataField = (params: FnSetTrackDataField): TPTrackList => {
  const { isIncluded, layerKey, times, trackIndex, trackName, visualizedDataKey } = params;
  const { SUMMARY, LAYER, BONE } = TP_TRACK_INDEX;
  const remainder = trackIndex % 10;
  const isPointedDownArrow = trackIndex === SUMMARY ? true : false;
  const isShowed = _.some([SUMMARY, LAYER], (index) => index === remainder);
  const isTransformTrack = _.every([SUMMARY, LAYER, BONE], (idx) => idx !== remainder);
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

export default fnSetTrackDataField;
