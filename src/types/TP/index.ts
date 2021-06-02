export interface TPTrackList {
  isFiltered: boolean; // sheet 필터링 체크
  isIncluded: boolean; // sheet 랜더링 제외 체크
  isLocked: boolean; // sheet 잠금 체크
  isPointedDownArrow: boolean; // 화살표 방향이 아래를 가리키고 있는지 체크(true면 아래를 가리킴)
  isSelected: boolean; // dope sheet 선택 체크
  isShowed: boolean; // 트랙이 화면에 보이는지 체크
  isTransformTrack: boolean; // 현재 트랙이 transform 트랙인지 아닌지 체크
  layerKey: 'baseLayer' | string; // 어떤 layer에 속했는지 key로 표현. base layer일 경우, key는 'baseLayer'가 됨
  renderedTrackName: string; // 화면 상에서 보여질 name
  trackIndex: number; // 트랙 index
  trackName: string;
  times: number[];
  visualizedDataKey: string;
  x?: number[];
  y?: number[];
  z?: number[];
}

export type UpdatedTrack<Key extends keyof TPTrackList> = Required<Pick<TPTrackList, Key>> & {
  trackIndex: number;
};

export interface TPLastBone {
  layerIndex: number;
  layerKey: string;
  trackName: string;
  lastBoneIndex: number;
}

export interface TPcurrentClickedTrack {
  trackIndex: number;
  isPointedDownArrow: boolean;
}

export interface KeyframeData {
  key: string;
  trackName: string;
  layerKey: string;
  time: number;
  isTransformTrack: boolean;
  isLocked: boolean;
  trackIndex: number;
}

export type d3ScaleLinear = d3.ScaleLinear<number, number, never>;
