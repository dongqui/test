import { ShootLayer, ShootTrack } from 'types/common';
import { TrackListState } from 'reducers/trackList';

export interface Serivice {
  // viewport에 visualize 시, TP 내 데이터 초기화
  visualizeAnimation(list: ShootLayer[]): Partial<TrackListState>;

  // viewport에 selected targets 변경 시, TP 내 데이터 초기화
  changeSelectedTargets(list: ShootTrack[]): Partial<TrackListState>;
}
