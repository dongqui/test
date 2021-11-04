import { TrackIdentifier } from './index';

/**
 * @description postion, rotation, scale 키프레임이 가지고 있는 value
 */
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// 키프레임 데이터 타입
export interface Keyframe {
  /**
   * @description 삭제 된 키프레임인지 체크
   * @default false false인 경우 화면이 키프레임이 보임. true인 경우 화면에 키프레임이 보이지 않음
   */
  isDeleted: boolean;

  /**
   * @description 키프레임에 선택 효과가 적용 되었는지 체크
   * @default false false인 경우 선택 효과 미적용
   */
  isSelected: boolean;

  time: number;

  value?: Vector3;
}

// 트랙 별 데이터 타입
export type TimeEditorTrack = TrackIdentifier & {
  keyframes: Keyframe[];
};

// 선택 된 키프레임 데이터 타입
export type SelectedKeyframe = TrackIdentifier & {
  time: number;
};

// 선택 된 키프레임들을 cluster
export type ClusteredKeyframe = TrackIdentifier & {
  times: number[];
};
