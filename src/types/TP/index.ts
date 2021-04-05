export type TPDopeSheetStatus =
  | 'isSelected'
  | 'isLocked'
  | 'isExcludedRendering'
  | 'isClickedParentTrack'
  | 'isFiltered';

export interface TPTrackName {
  childrenTrackList: TPTrackName[]; // 하위 트랙 리스트
  isOpenedChildrenTrack: boolean; // 트랙 생성 시 하위 트랙을 펼친 상태로 출력여부(true면 펼친 상태로 출력)
  name: string; // 트랙 이름
  trackIndex: number; // 트랙 index
}

export interface TPDopeSheet {
  isSelected: boolean; // dope sheet 선택 체크
  isLocked: boolean; // sheet 잠금 체크
  isExcludedRendering: boolean; // sheet 랜더링 제외 체크
  isClickedParentTrack: boolean; // 상위 트랙에 화살표 버튼이 클릭되어 있는지
  isFiltered: boolean; // sheet 필터링 체크
  trackIndex: number; // 트랙 index
  times?: number[];
  x?: number[];
  y?: number[];
  z?: number[];
}

export interface TPLastBoneTrackIndex {
  layerIdnex: number;
  lastBoneTrackIndex: number;
}

export interface TPUpdateDopeSheet {
  updatedList: Partial<TPDopeSheet>[];
  status: TPDopeSheetStatus;
}
