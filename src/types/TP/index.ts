// layer, bone, property 트랙 별 number
export enum TrackNumber {
  LAYER = -1,
  BONE = 0,
  POSITION = 1,
  ROTATION = 2,
  SCALE = 3,
}

export type TrackType = 'layer' | 'bone' | 'property';

// 트랙 식별자 타입
export interface TrackIdentifier {
  trackNumber: number;

  /**
   * @description RP쪽에서 트랙을 탐색하기 위한 ID
   * @default uuid layer 트랙의 layerId를 값으로 사용
   * @default uuid bone 트랙의 targetId를 값으로 사용
   * @default uuid property 트랙의 id를 값으로 사용
   */
  trackId: string;

  trackType: TrackType;
  parentTrackNumber: number;
}
