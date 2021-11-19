import { PlaskTrack } from 'types/common';
import { KeyframesState } from 'reducers/keyframes';

export interface Service {
  // viewport에 selected targets 변경 시, TP 내 데이터 초기화
  changeSelectedTargets(list: PlaskTrack[]): Partial<KeyframesState>;

  clearAnimation(): Partial<KeyframesState>;
}
