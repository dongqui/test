// export interface TPBoneTrack {
//   children: string[];
//   isChildTrackOpen: boolean;
//   title: string;
// }

// export interface TPTransformTrack {
//   interpolation: string;
//   name: string;
//   property: string;
//   times: number[];
//   keyframes: number[];
//   x: number[];
//   y: number[];
//   z: number[];
// }

// export interface TPTrack {
//   frameViewStatus: 'both' | 'curveEditor' | 'dopeSheet';
//   index: number;
//   interpolation: string;
//   isHidden: boolean;
//   isSelected: boolean;
//   name: string;
//   times: number[];
//   values?: number[];
// }

export interface TPTrackName {
  childrenTrackList: TPTrackName[]; // 하위 트랙 리스트
  defaultChildrenTrackOpened: boolean; // 트랙 생성 시 하위 트랙을 펼친 상태로 출력여부(true면 펼친 상태로 출력)
  name: string; // 트랙 이름
  trackIndex: number; // 트랙 index
}

export interface TPDopeSheet {
  isSelected: boolean; // dope sheet 선택 체크
  isShowed: boolean; // sheet 출력 체크
  isLocked: boolean; // sheet 잠금 체크
  isExcludedRendering: boolean; // sheet 랜더링 제외 체크
  isClickedParentTrackArrowBtn: boolean;
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

export interface TPDopeSheetStatus {
  isSelected: boolean; // dope sheet 선택 체크
  isShowed: boolean; // sheet 출력 체크
  isLocked: boolean; // sheet 잠금 체크
  isExcludedRendering: boolean; // sheet 랜더링 제외 체크
  isFiltered: boolean; // sheet 필터링 체크
  trackIndex: number; // 트랙 index
  times?: number[];
}

export interface TPDopeSheetData {
  trackIndex: number; // 트랙 index
  times?: number[];
  x?: number[];
  y?: number[];
  z?: number[];
}
