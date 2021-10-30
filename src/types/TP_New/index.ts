// bone, transform 트랙 별 index
export enum TrackNumber {
  LAYER = -1,
  BONE = 0,
  POSITION = 1,
  ROTATION = 2,
  SCALE = 3,
}

// 트랙 식별자 데이터 타입
export interface TrackIdentifier {
  /**
   * @description TP쪽에서 트랙을 탐색하기 위한 인덱스
   * @default -1 layer 트랙의 index는 -1로 세팅
   * @default 0 bone 트랙의 index는 끝자리를 0으로 세팅(0, 10, 20...)
   * @default 1 position 트랙의 index는 끝자리를 1으로 세팅(1, 11, 21...)
   * @default 2 rotation 트랙의 index는 끝자리를 2으로 세팅(2, 12, 22...)
   * @default 3 scale 트랙의 index는 끝자리를 3으로 세팅(3, 13, 23...)
   */
  trackNumber: number;

  /**
   * @description RP쪽에서 트랙을 탐색하기 위한 ID
   * @default uuid layer 트랙의 id는 RP의 layerId로 세팅
   * @default uuid bone 트랙의 id는 빈 문자로 세팅
   * @default property transform 트랙의 id는 RP의 id로 세팅
   */
  trackId: string;
}
