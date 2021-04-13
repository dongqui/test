interface SetDopeSheetStatus {
  isClickedParentTrack: boolean;
  isTransformTrack: boolean;
  layerKey?: string;
  times: number[];
  trackIndex: number;
  trackName: string;
}

/**
 * dope shee의 status를 생성하는 함수입니다.
 * layerKey의 값을 주지 않을 경우, 기본적으로 baseLayer으로 값을 내려줍니다.
 *
 * @param isClickedParentTrack -
 * @param isTransformTrack -
 * @param layerKey -
 * @param times -
 * @param trackIndex -
 * @param trackName -
 * @return dopeSheetStatus
 */
const setDopeSheetStatus = ({
  isClickedParentTrack,
  isTransformTrack,
  layerKey = 'baseLayer',
  times,
  trackIndex,
  trackName,
}: SetDopeSheetStatus) => ({
  isSelected: false,
  isLocked: false,
  isIncluded: true,
  isFiltered: true,
  isClickedParentTrack,
  isKeyframeSelected: false,
  isTransformTrack,
  layerKey,
  trackIndex,
  trackName,
  times,
});

export default setDopeSheetStatus;
