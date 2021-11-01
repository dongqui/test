// layer, bone, property 트랙 별 number
export enum TrackNumber {
  LAYER = -1,
  BONE = 0,
  POSITION = 1,
  ROTATION = 2,
  SCALE = 3,
}

// 트랙 식별자 타입
export interface TrackIdentifier {
  /**
   * @description TP쪽에서 트랙을 탐색하기 위한 인덱스
   * @default -1 layer 트랙의 number는 -1로 세팅
   * @default 0 bone 트랙의 number는 끝자리를 0으로 세팅(0, 10, 20...)
   * @default 1 position 트랙의 number는 끝자리를 1으로 세팅(1, 11, 21...)
   * @default 2 rotation 트랙의 number는 끝자리를 2으로 세팅(2, 12, 22...)
   * @default 3 scale 트랙의 number는 끝자리를 3으로 세팅(3, 13, 23...)
   */
  trackNumber: number;

  trackType: 'layer' | 'bone' | 'property';
}

export interface LayerIdentifier extends TrackIdentifier {
  /**
   * @description RP쪽에서 layer 트랙을 탐색하기 위한 ID
   * @default uuid layer 트랙의 id는 RP의 layerId로 세팅
   */
  layerId: string;
}

export interface BoneIdentifier extends TrackIdentifier {
  /**
   * @description RP쪽에서 bone 트랙을 탐색하기 위한 ID
   * @default uuid bone 트랙의 id는 RP의 targetId로 세팅
   */
  targetId: string;
}

export interface PropertyIdentifier extends TrackIdentifier {
  /**
   * @description RP쪽에서 property 트랙을 탐색하기 위한 ID
   */
  property: 'position' | 'rotation' | 'scale';
}
