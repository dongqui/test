import { TrackIdentifier } from './index';

/**
 * @description postion, rotation, scale 키프레임이 가지고 있는 value
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface TrasnformKey {
  time: number;

  /**
   * @description property keyframe이 가지고 있는 value 데이터
   * @optional property keyframe인 경우 value에다가 Vector3값을 할당
   */
  value?: Vector3;
}

// 키프레임 데이터 타입
export interface Keyframe extends TrasnformKey {
  /**
   * @description 삭제 된 키프레임인지 체크
   * @default false false인 경우 화면에 키프레임이 보임. true인 경우 화면에 키프레임이 보이지 않음
   */
  isDeleted: boolean;

  /**
   * @description 키프레임에 선택 효과가 적용 되었는지 체크
   * @default false false인 경우 선택 효과 미적용
   */
  isSelected: boolean;
}

// 트랙 별 데이터 타입
export type TimeEditorTrack = TrackIdentifier & {
  keyframes: Keyframe[];
};

// 선택 된 키프레임 데이터 타입
export type SelectedKeyframe = TrackIdentifier & TrasnformKey;

// 선택 된 키프레임들을 cluster
export type ClusteredKeyframe = TrackIdentifier & {
  keyframes: TrasnformKey[];
};

export interface UpdatedTransformKey {
  trackId: string;

  from?: number;

  to: number;

  value: Vector3;
}

export interface UpdatedPropertyKeyframes {
  animationIngredientId: string;

  layerId: string;

  transformKeys: UpdatedTransformKey[];
}
