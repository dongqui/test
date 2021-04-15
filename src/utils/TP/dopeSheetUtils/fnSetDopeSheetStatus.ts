interface SetDopeSheetStatus {
  isClickedParentTrack: boolean;
  isTransformTrack: boolean;
  isIncluded: boolean;
  layerKey?: string;
  times: { time: number; isClicked: boolean }[];
  trackIndex: number;
  trackName: string;
}

/**
 * dope shee의 status를 생성하는 함수입니다.
 * layerKey의 값을 주지 않을 경우, 기본적으로 baseLayer으로 값을 내려줍니다.
 *
 * @param isClickedParentTrack -
 * @param isIncluded -
 * @param isTransformTrack -
 * @param layerKey -
 * @param times -
 * @param trackIndex -
 * @param trackName -
 * @return dopeSheetStatus
 */
const setDopeSheetStatus = ({
  isClickedParentTrack,
  isIncluded,
  isTransformTrack,
  layerKey = 'baseLayer',
  times,
  trackIndex,
  trackName,
}: SetDopeSheetStatus) => ({
  isSelected: false,
  isLocked: false,
  isIncluded,
  isFiltered: true,
  isClickedParentTrack,
  isTransformTrack,
  layerKey,
  trackIndex,
  trackName,
  times,
});

export default setDopeSheetStatus;
