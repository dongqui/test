import { TrackIdentifier, PropertyIdentifier } from './index';

/**
 * @description property 키프레임이 가지고 있는 value
 */
interface Vector3 {
  _isdirty: boolean;
  _x: number;
  _y: number;
  _z: number;
}

/**
 * @description property 트랙인 경우 PropertyKeyframe[] 타입
 * @description layer와 bone 트랙인 경우 Keyframe[] 타입
 */
type KeyframesType<TI extends TrackIdentifier> = TI extends PropertyIdentifier
  ? {
      keyframes: PropertyKeyframe[];
    }
  : {
      keyframes: Keyframe[];
    };

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

  time: number;
}

// property 키프레임 데이터 타입
export interface PropertyKeyframe extends Keyframe {
  value: Vector3;
}

// 트랙 별 데이터 타입
export type TimeEditorTrack<TI extends TrackIdentifier> = TI & KeyframesType<TI>;

// 선택 된 키프레임 데이터 타입
export type SelectedKeyframe<TI extends TrackIdentifier> = TI & {
  time: number;
};

// 선택 된 키프레임들을 cluster
export type ClusteredKeyframe<TI extends TrackIdentifier> = TI & {
  times: number[];
};
