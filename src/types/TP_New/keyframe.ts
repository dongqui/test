import { TrackIdentifier } from './index';

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

// transform 키프레임 데이터 타입
export interface TransformKeyframe extends Keyframe {
  value: number;
}

// 트랙 별 데이터 타입
export interface EditorTrack extends TrackIdentifier {
  keyframes: Keyframe[] | TransformKeyframe[];
}

// 선택 된 키프레임 데이터 타입
export interface SelectedKeyframe extends TrackIdentifier {
  time: number;
}

// 선택 된 키프레임들을 cluster
export interface ClusteredKeyframe extends TrackIdentifier {
  times: number[];
}
