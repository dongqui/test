interface SetDopeSheetStatus {
  isOpenedParentTrack: boolean;
  isTransformTrack: boolean;
  isIncluded: boolean;
  layerKey?: string;
  times: { time: number; isClicked: boolean }[];
  trackIndex: number;
  trackName: string;
  visualizedDataKey: string;
}

/**
 * dope shee의 status를 생성하는 함수입니다.
 * layerKey의 값을 주지 않을 경우, 기본적으로 baseLayer으로 값을 내려줍니다.
 *
 * @param isOpenedParentTrack -
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
  isOpenedParentTrack,
  isIncluded,
  isTransformTrack,
  layerKey = 'baseLayer',
  times,
  trackIndex,
  trackName,
  visualizedDataKey,
}: SetDopeSheetStatus) => ({
  isSelected: false,
  isLocked: false,
  isIncluded,
  isFiltered: true,
  isOpenedParentTrack,
  isTransformTrack,
  layerKey,
  trackIndex,
  trackName,
  times,
  visualizedDataKey,
});

export default setDopeSheetStatus;
