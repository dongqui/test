export type TPDopeSheetStatus =
  | 'isSelected'
  | 'isLocked'
  | 'isIncluded'
  | 'isClickedParentTrack'
  | 'isFiltered'
  | 'times';

export interface TPTrackName {
  childrenTrackList: TPTrackName[]; // 하위 트랙 리스트
  isOpenedChildrenTrack: boolean; // 트랙 생성 시 하위 트랙을 펼친 상태로 출력여부(true면 펼친 상태로 출력)
  name: string; // 트랙 이름
  trackIndex: number; // 트랙 index
}

export interface TPDopeSheet {
  isSelected: boolean; // dope sheet 선택 체크
  isLocked: boolean; // sheet 잠금 체크
  isIncluded: boolean; // sheet 랜더링 제외 체크
  isClickedParentTrack: boolean; // 상위 트랙에 화살표 버튼이 클릭되어 있는지
  isFiltered: boolean; // sheet 필터링 체크
  isTransformTrack: boolean; // 현재 트랙이 transform 트랙인지 아닌지 체크
  // isKeyframeSelected: boolean[];
  layerKey: 'baseLayer' | string; // 어떤 layer에 속했는지 key로 표현. base layer일 경우, key는 'baseLayer'가 됨
  trackIndex: number; // 트랙 index
  trackName: string;
  // times?: number[];
  times: { time: number; isClicked: boolean }[];
  x?: number[];
  y?: number[];
  z?: number[];
}

export interface TPLastBone {
  layerIndex: number;
  lastBoneIndex: number;
}

export interface TPUpdateDopeSheet {
  updatedList: Partial<TPDopeSheet>[];
  status: TPDopeSheetStatus;
}

export interface TPCurrnetClickedTrack {
  trackIndex: number;
  isClickedArrow: boolean;
}

export interface KeyframeData {
  key: string;
  trackName: string;
  layerKey: string;
  time: number;
  isTransformTrack: boolean;
  trackIndex: number;
}

export interface IsIncludedChange {
  name: string;
  isIncluded: boolean;
}

export type d3ScaleLinear = d3.ScaleLinear<number, number, never>;
