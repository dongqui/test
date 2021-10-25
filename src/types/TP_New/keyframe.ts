// 키프레임 데이터 타입
export interface Keyframe {
  /**
   * @description 삭제 된 키프레임인지 체크
   * @default false false인 경우 삭제되지 않음. true인 경우 삭제 된 키프레임
   */
  isDeleted: boolean;

  /**
   * @description 키프레임에 선택 효과가 적용 되었는지 체크
   * @default false false인 경우 선택 효과 미적용
   */
  isSelected: boolean;

  timeIndex: number;

  value: number;
}

// 트랙 별 데이터 타입
export interface TrackKeyframes {
  /**
   * @description layer track은 string id
   * @description bone, transform track은 number형 index
   */
  trackIndex: number | string;

  keyframes: Keyframe[];
}

// 선택 된 키프레임 데이터 타입
export interface SelectedKeyframe {
  /**
   * @description layer track은 string id
   * @description bone, transform track은 number형 index
   */
  trackIndex: number | string;

  timeIndex: number;
}

// 선택 된 키프레임들을 cluster
export interface ClusteredTimes {
  /**
   * @description TP쪽에서 키프레임을 탐색하기 위한 인덱스
   */
  trackIndex: number | string;

  /**
   * @description RP쪽에서 키프레임을 탐색하기 위한 ID
   */
  trackId: string;

  times: number[];
}
