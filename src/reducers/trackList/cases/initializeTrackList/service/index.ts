import { PlaskLayer, PlaskTrack } from 'types/common';
import { TrackListState } from 'reducers/trackList';

export interface Serivice {
  // viewport에 visualize 시, TP 내 데이터 초기화
  visualizeAnimation(list: PlaskLayer[]): Partial<TrackListState>;

  // viewport에 selected targets 변경 시, TP 내 데이터 초기화
  changeSelectedTargets(list: PlaskTrack[]): Partial<TrackListState>;

  // viewport에 애니메이션 clear
  clearAnimation(): Partial<TrackListState>;
}
