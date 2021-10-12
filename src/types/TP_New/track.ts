export enum TrackIndex {
  BONE = 0,
  POSITION_X = 1,
  POSITION_Y = 2,
  POSITION_Z = 3,
  ROTATION_X = 4,
  ROTATION_Y = 5,
  ROTATION_Z = 6,
  SCALE_X = 7,
  SCALE_Y = 8,
  SCALE_Z = 9,
}

export type InterpolationType = 'bezier' | 'constant' | 'linear' | 'none';

export interface TimelinePanelTrack {
  /**
   * @description 트랙을 클릭하여 선택 효과가 적용 되었는지 체크
   * @default false false인 경우 선택 효과 미적용
   */
  isSelected: boolean;

  trackName: string;
}

export interface LayerTrack extends TimelinePanelTrack {
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

  layerId: string;
}

export interface BoneTrack extends TimelinePanelTrack {
  /**
   * @description 화살표 버튼 방향이 아래를 향하는지 체크
   * @default false false인 경우 우측을 가리킴(닫힘). true인 경우 아래를 가리킴(열림)
   */
  isPointedDownCaret: boolean;

  boneIndex: number;
}

export interface TransformTrack extends TimelinePanelTrack {
  interpolationType: InterpolationType;

  transformIndex: number;
}
