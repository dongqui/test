import { TrackIdentifier } from './index';

// export type InterpolationType = 'bezier' | 'constant' | 'linear' | 'none';
export type TrackType = 'layer' | 'bone' | 'transform';

export interface Track extends TrackIdentifier {
  /**
   * @description 트랙을 클릭하여 선택 효과가 적용 되었는지 체크
   * @default false false인 경우 선택 효과 미적용
   */
  isSelected: boolean;

  trackName: string;

  trackType: TrackType;
}

export interface LayerTrack extends Track {
  /**
   * @description 화살표 버튼 방향이 아래를 향하는지 체크
   * @default false false인 경우 우측을 가리킴(닫힘). true인 경우 아래를 가리킴(열림)
   */
  isPointedDownCaret: boolean;

  /**
   * @description 애니메이션 재생 시 포함/제외되는지 체크
   * @default false false인 경우 애니메이션 재생에 포함. true인 경우 애니메이션 재생에 제외
   */
  isMuted: boolean;
}

export interface BoneTrack extends Track {
  /**
   * @description 화살표 버튼 방향이 아래를 향하는지 체크
   * @default false false인 경우 우측을 가리킴(닫힘). true인 경우 아래를 가리킴(열림)
   */
  isPointedDownCaret: boolean;
}

export interface TransformTrack extends Track {
  interpolationType: 'linear';
}
